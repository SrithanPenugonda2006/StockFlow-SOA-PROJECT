package com.omnistock.auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;

@SpringBootApplication
public class AuthServiceApplication {

	public static void main(String[] args) {
		loadDotEnv();
		SpringApplication.run(AuthServiceApplication.class, args);
	}

	private static void loadDotEnv() {
		try {
			File envFile = new File("../.env");
			if (!envFile.exists()) {
				envFile = new File(".env");
			}
			if (envFile.exists()) {
				Files.lines(envFile.toPath()).forEach(line -> {
					line = line.trim();
					if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
						String[] parts = line.split("=", 2);
						String key = parts[0].trim();
						String value = parts[1].trim();
						if (System.getProperty(key) == null && System.getenv(key) == null) {
							System.setProperty(key, value);
						}
					}
				});
				System.out.println("[ENV LOADER] Environment variables loaded from " + envFile.getAbsolutePath());
			}
		} catch (Exception e) {
			System.err.println("[ENV LOADER WARNING] Failed to load .env file: " + e.getMessage());
		}
	}
}
