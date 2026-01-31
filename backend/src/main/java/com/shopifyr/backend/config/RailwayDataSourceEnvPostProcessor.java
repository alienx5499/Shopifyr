package com.shopifyr.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Lets Railway's default variables work without renaming them.
 * If DB_URL is not set but DATABASE_URL is (e.g. Railway reference), use jdbc:DATABASE_URL.
 * Username/password fallbacks (PGUSER, PGPASSWORD) are handled in application-prod.properties.
 */
public class RailwayDataSourceEnvPostProcessor implements EnvironmentPostProcessor {

    private static final String DATABASE_URL = "DATABASE_URL";
    private static final String DB_URL = "DB_URL";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty(DB_URL);
        if (dbUrl != null && !dbUrl.isBlank()) {
            return; // already set
        }
        String databaseUrl = environment.getProperty(DATABASE_URL);
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }
        String jdbcUrl = databaseUrl.startsWith("jdbc:") ? databaseUrl : "jdbc:" + databaseUrl;
        Map<String, Object> map = new HashMap<>();
        map.put("spring.datasource.url", jdbcUrl);
        environment.getPropertySources().addFirst(new MapPropertySource("railway-datasource", map));
    }
}
