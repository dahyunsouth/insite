package com.ssafy.insite.auth.utils;

import com.ssafy.insite.common.dto.response.BaseResponseStatus;
import com.ssafy.insite.common.exception.BaseException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

public class HTMLTemplateReader {
    public static String loadTemplateAsString(String templatePath) {
        try {
            Resource resource = new ClassPathResource(templatePath);
            InputStream inputStream = resource.getInputStream();
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new BaseException(BaseResponseStatus.MAIL_SEND_FAIL);
        }
    }
}
