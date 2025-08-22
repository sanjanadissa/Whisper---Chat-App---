package com.example.Whisper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WhisperApplication {

	public static void main(String[] args) {
		SpringApplication.run(WhisperApplication.class, args);
		
	}

}
