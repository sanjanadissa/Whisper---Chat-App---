package com.example.Whisper.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    private Cloudinary cloudinary;

    @Autowired
    public UploadController(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @PostMapping("/profile")
    public ResponseEntity<?> uploadProfile(Authentication auth, @RequestParam("file") MultipartFile file) {
        try {
            // Debug logging
            System.out.println("Upload request received");
            System.out.println("Authentication: " + (auth != null ? auth.getName() : "null"));
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "profile_pictures"));

            System.out.println("Upload successful: " + uploadResult.get("secure_url"));
            System.out.println("Cloudinary public ID: " + uploadResult.get("public_id"));
            return ResponseEntity.ok(uploadResult.get("secure_url"));

        } catch (IOException e) {
            System.err.println("Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/test-upload")
    public ResponseEntity<?> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("Test upload request received");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "test_uploads"));

            System.out.println("Test upload successful: " + uploadResult.get("secure_url"));
            System.out.println("Cloudinary public ID: " + uploadResult.get("public_id"));
            return ResponseEntity.ok(uploadResult.get("secure_url"));

        } catch (Exception e) {
            System.err.println("Test upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Test upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/test-cloudinary-config")
    public ResponseEntity<?> testCloudinaryConfig() {
        try {
            System.out.println("Testing Cloudinary configuration...");
            
            // Try to get account info to verify configuration
            Map result = cloudinary.api().ping(ObjectUtils.emptyMap());
            System.out.println("Cloudinary ping successful: " + result);
            
            return ResponseEntity.ok("Cloudinary configuration is working: " + result);
        } catch (Exception e) {
            System.err.println("Cloudinary configuration test failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Cloudinary configuration test failed: " + e.getMessage());
        }
    }
}

