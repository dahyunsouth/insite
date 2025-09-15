package com.ssafy.insite.common.config;

import com.ssafy.insite.common.utils.SeoulDistrictConverter;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final SeoulDistrictConverter districtConverter;

    public WebConfig(SeoulDistrictConverter districtConverter) {
        this.districtConverter = districtConverter;
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(districtConverter);
    }
}
