plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("maven-publish")
}

android {
    namespace   = "com.apkhub.sdk"
    compileSdk  = 34

    defaultConfig {
        minSdk     = 21
        targetSdk  = 34
        aarMetadata { minCompileSdk = 21 }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}

publishing {
    publications {
        register<MavenPublication>("release") {
            groupId    = "com.apkhub"
            artifactId = "sdk"
            version    = "1.0.0"
            afterEvaluate { from(components["release"]) }
        }
    }
}
