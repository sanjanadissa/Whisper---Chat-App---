package com.example.Whisper.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dlwstjdjp",
                "api_key", "587812625396495",
                "api_secret", "zv_1D0K46pCOgOtIFi005eWHlSY",
                "secure", true
        ));
    }
}
