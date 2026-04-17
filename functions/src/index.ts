import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as https from "https";

admin.initializeApp();

const db = admin.firestore();
const vdocipherApiSecret = defineSecret("VDOCIPHER_API_SECRET");

// ===== ADMIN HELPER =====

async function verifyAdmin(uid: string): Promise<void> {
  const userDoc = await db.collection("users").doc(uid).get();
  if (userDoc.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}

// ===== ADMIN: ENROLLMENT MANAGEMENT =====

interface AdminEnrollmentRequest {
  enrollmentId: string;
  action: "approve" | "reject" | "revoke" | "delete";
}

export const adminUpdateEnrollment = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  await verifyAdmin(request.auth.uid);

  const {enrollmentId, action} = request.data as AdminEnrollmentRequest;

  if (!enrollmentId || !action) {
    throw new HttpsError("invalid-argument", "enrollmentId and action are required.");
  }

  const enrollmentRef = db.collection("enrollments").doc(enrollmentId);
  const enrollmentDoc = await enrollmentRef.get();

  if (!enrollmentDoc.exists) {
    throw new HttpsError("not-found", "Enrollment not found.");
  }

  switch (action) {
  case "approve":
    await enrollmentRef.update({
      status: "approved",
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    break;
  case "reject":
    await enrollmentRef.update({
      status: "rejected",
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    break;
  case "revoke":
    await enrollmentRef.update({
      status: "pending",
      reviewedAt: admin.firestore.FieldValue.delete(),
    });
    break;
  case "delete":
    await enrollmentRef.delete();
    break;
  default:
    throw new HttpsError("invalid-argument", `Unknown action: ${action}`);
  }

  return {success: true, action, enrollmentId};
});

// ===== ADMIN: ENQUIRY MANAGEMENT =====

interface AdminEnquiryRequest {
  enquiryId: string;
  action: "contacted" | "resolved" | "reopen" | "delete";
}

export const adminUpdateEnquiry = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  await verifyAdmin(request.auth.uid);

  const {enquiryId, action} = request.data as AdminEnquiryRequest;

  if (!enquiryId || !action) {
    throw new HttpsError("invalid-argument", "enquiryId and action are required.");
  }

  const enquiryRef = db.collection("enquiries").doc(enquiryId);
  const enquiryDoc = await enquiryRef.get();

  if (!enquiryDoc.exists) {
    throw new HttpsError("not-found", "Enquiry not found.");
  }

  if (action === "delete") {
    await enquiryRef.delete();
    return {success: true, action, enquiryId};
  }

  const statusMap: Record<string, string> = {
    contacted: "contacted",
    resolved: "resolved",
    reopen: "new",
  };

  await enquiryRef.update({
    followUpStatus: statusMap[action],
    followUpUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {success: true, action, enquiryId};
});

// ===== ADMIN: EDIT STUDENT COURSE ACCESS =====

const COURSE_NAMES: Record<string, string> = {
  "1_year_foundation": "1 Year Foundation",
  "2_year_foundation": "2 Year Foundation",
  "3_year_foundation": "3 Year Foundation",
  "apmc_1_0": "APMC 1.0",
  "apmc_2_0": "APMC 2.0",
  "csat": "CSAT",
};

interface AdminEditCoursesRequest {
  uid: string;
  courseIds: string[];
}

export const adminEditStudentCourses = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  await verifyAdmin(request.auth.uid);

  const {uid, courseIds} = request.data as AdminEditCoursesRequest;

  if (!uid || !Array.isArray(courseIds)) {
    throw new HttpsError("invalid-argument", "uid and courseIds are required.");
  }

  const existingSnap = await db
    .collection("enrollments")
    .where("uid", "==", uid)
    .get();

  const batch = db.batch();
  const existingMap = new Map<string, string>();

  for (const d of existingSnap.docs) {
    existingMap.set(d.data().courseId as string, d.id);
  }

  // Delete enrollments for courses not in new list
  for (const [courseId, docId] of existingMap) {
    if (!courseIds.includes(courseId)) {
      batch.delete(db.collection("enrollments").doc(docId));
    }
  }

  // Upsert enrollments for courses in new list
  for (const courseId of courseIds) {
    if (existingMap.has(courseId)) {
      batch.update(db.collection("enrollments").doc(existingMap.get(courseId)!), {
        status: "approved",
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      const newRef = db.collection("enrollments").doc();
      batch.set(newRef, {
        uid,
        courseId,
        courseName: COURSE_NAMES[courseId] || courseId,
        status: "approved",
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  await batch.commit();
  return {success: true};
});

interface OtpRequest {
  videoId: string;
  courseId: string;
}

interface OtpResponse {
  otp: string;
  playbackInfo: string;
}

function vdoCipherOtpRequest(
  videoId: string,
  annotations: Record<string, string>[],
  apiSecret: string
): Promise<OtpResponse> {
  return new Promise((resolve, reject) => {
    // VdoCipher requires single-quoted annotation format, not standard JSON
    const annotateStr = JSON.stringify(annotations).replace(/"/g, "'");
    const body = JSON.stringify({
      annotate: annotateStr,
    });

    const options: https.RequestOptions = {
      hostname: "dev.vdocipher.com",
      path: `/api/videos/${videoId}/otp`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Apisecret ${apiSecret}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode !== 200) {
            reject(new Error(parsed.message ||
              `VdoCipher API error: ${res.statusCode}`));
            return;
          }
          resolve({otp: parsed.otp, playbackInfo: parsed.playbackInfo});
        } catch (e) {
          reject(new Error("Failed to parse VdoCipher response"));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export const getVdoCipherOtp = onCall(
  {secrets: [vdocipherApiSecret]},
  async (request) => {
    // Ensure the user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to watch videos."
      );
    }

    const {videoId, courseId} = request.data as OtpRequest;

    if (!videoId || !courseId) {
      throw new HttpsError(
        "invalid-argument",
        "videoId and courseId are required."
      );
    }

    // Verify enrollment
    const uid = request.auth.uid;
    const enrollmentsSnap = await db
      .collection("enrollments")
      .where("uid", "==", uid)
      .where("courseId", "==", courseId)
      .where("status", "==", "approved")
      .limit(1)
      .get();

    if (enrollmentsSnap.empty) {
      throw new HttpsError(
        "permission-denied",
        "You are not enrolled in this course."
      );
    }

    // Get user details for watermark
    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    const userName = userData?.name ?? "Student";
    const userEmail = userData?.email ?? request.auth.token.email ?? "";

    // Build watermark annotations (VdoCipher annotation format)
    const annotations = [
      {
        type: "rtext",
        text: `${userName} | ${userEmail}`,
        alpha: "0.60",
        color: "0xFFFFFF",
        size: "15",
        interval: "5000",
      },
    ];

    // Request OTP from VdoCipher with watermark
    try {
      const result = await vdoCipherOtpRequest(
        videoId,
        annotations,
        vdocipherApiSecret.value()
      );
      return result;
    } catch (err) {
      console.error("VdoCipher OTP error:", err);
      throw new HttpsError(
        "internal",
        "Failed to load video. Please try again later."
      );
    }
  }
);
