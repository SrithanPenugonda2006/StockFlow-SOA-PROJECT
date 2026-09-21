package com.omnistock.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.predicate.GatewayRequestPredicates.path;

@Configuration
public class GatewayConfig {

    @Bean
    public RouterFunction<ServerResponse> authRoute() {
        return route("auth-service")
                .route(path("/api/auth/**"), http())
                .filter(lb("AUTH-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> adminRoute() {
        return route("admin-service")
                .route(path("/api/admin/**"), http())
                .filter(lb("AUTH-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> productRoute() {
        return route("product-service")
                .route(path("/api/products/**"), http())
                .filter(lb("PRODUCT-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> inventoryRoute() {
        return route("inventory-service")
                .route(path("/api/inventory/**"), http())
                .filter(lb("INVENTORY-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> orderRoute() {
        return route("order-service")
                .route(path("/api/orders/**"), http())
                .filter(lb("ORDER-SERVICE"))
                .build();
    }

    @Bean
    public org.springframework.web.filter.CorsFilter corsFilter() {
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new org.springframework.web.filter.CorsFilter(source);
    }
}
