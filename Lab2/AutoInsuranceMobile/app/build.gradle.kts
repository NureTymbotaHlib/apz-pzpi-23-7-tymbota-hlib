plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.nure.autoinsurancemobile"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.nure.autoinsurancemobile"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    // Fix for Android Studio/Gradle builds where Java uses JVM 1.8
    // and Kotlin tries to compile with JVM 21.
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}
