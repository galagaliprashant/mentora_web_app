import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        courses: resolve(__dirname, 'courses.html'),
        freeClass: resolve(__dirname, 'free-class.html'),
        login: resolve(__dirname, 'login.html'),
        studentCorner: resolve(__dirname, 'student-corner.html'),
        videos: resolve(__dirname, 'videos.html'),
        admin: resolve(__dirname, 'admin.html'),
        connect: resolve(__dirname, 'connect.html'),
      },
    },
  },
})
