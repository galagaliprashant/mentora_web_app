import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as https from "https";

admin.initializeApp();

const vdocipherApiSecret = defineSecret("VDOCIPHER_API_SECRET");

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
    const enrollmentsSnap = await admin
      .firestore()
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
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
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
