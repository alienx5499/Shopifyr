package com.shopifyr.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Lets Railway's default variables work without renaming them.
 * If DB_URL is not set but DATABASE_URL is (e.g. Railway reference), build a JDBC URL
 * and set username/password from the URI so the driver never misparses host.
 * Username/password fallbacks (PGUSER, PGPASSWORD) are still in application-prod.properties.
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
        String normalized = databaseUrl.trim();
        if (normalized.startsWith("postgres://")) {
            normalized = "postgresql://" + normalized.substring("postgres://".length());
        }
        if (!normalized.startsWith("postgresql://") && !normalized.startsWith("jdbc:postgresql://")) {
            return;
        }
        String toParse = normalized.startsWith("jdbc:") ? normalized.substring(5) : normalized;
        try {
            URI uri = new URI(toParse);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();
            String database = (path != null && path.length() > 1) ? path.substring(1) : "railway";
            String userInfo = uri.getUserInfo();
            String jdbcUrlOnly = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            Map<String, Object> map = new HashMap<>();
            map.put("spring.datasource.url", jdbcUrlOnly);
            if (userInfo != null && !userInfo.isBlank()) {
                int colon = userInfo.indexOf(':');
                if (colon > 0) {
                    map.put("spring.datasource.username", userInfo.substring(0, colon));
                    map.put("spring.datasource.password", userInfo.substring(colon + 1));
                } else {
                    map.put("spring.datasource.username", userInfo);
                }
            }
            environment.getPropertySources().addFirst(new MapPropertySource("railway-datasource", map));
        } catch (Exception ignored) {
            // fallback: prepend jdbc: and hope driver parses correctly
            String jdbcUrl = toParse.startsWith("jdbc:") ? toParse : "jdbc:" + toParse;
            Map<String, Object> map = new HashMap<>();
            map.put("spring.datasource.url", jdbcUrl);
            environment.getPropertySources().addFirst(new MapPropertySource("railway-datasource", map));
        }
    }
}
