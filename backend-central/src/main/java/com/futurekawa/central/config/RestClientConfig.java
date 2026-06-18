package com.futurekawa.central.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient restClient(PaysProperties props) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(props.getClient().getConnectTimeoutMs());
        factory.setReadTimeout(props.getClient().getReadTimeoutMs());
        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }
}
