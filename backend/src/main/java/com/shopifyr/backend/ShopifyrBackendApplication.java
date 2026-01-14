package com.shopifyr.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ShopifyrBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopifyrBackendApplication.class, args);
	}

}
