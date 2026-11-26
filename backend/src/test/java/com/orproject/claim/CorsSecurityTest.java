package com.orproject.claim;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CorsSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testVercelPreviewOriginPreflightAndClaimsGetAllowed() throws Exception {
        String previewOrigin = "https://claim-flow-q2amoad40-kd-2609.vercel.app";

        mockMvc.perform(options("/api/claims")
                        .queryParam("page", "0")
                        .queryParam("size", "8")
                        .header("Origin", previewOrigin)
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", previewOrigin));

        mockMvc.perform(get("/api/claims")
                        .queryParam("page", "0")
                        .queryParam("size", "8")
                        .header("Origin", previewOrigin))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", previewOrigin));
    }

    @Test
    void testProductionAndLocalhostOriginsAllowed() throws Exception {
        for (String origin : new String[]{
                "https://claim-flow-self.vercel.app",
                "https://claim-flow-gamma.vercel.app",
                "http://localhost:5173"
        }) {
            mockMvc.perform(options("/api/dashboard/stats")
                            .header("Origin", origin)
                            .header("Access-Control-Request-Method", "GET"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin));
        }
    }

    @Test
    void testUntrustedOriginRejected() throws Exception {
        mockMvc.perform(options("/api/claims")
                        .header("Origin", "https://untrusted.example.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}

