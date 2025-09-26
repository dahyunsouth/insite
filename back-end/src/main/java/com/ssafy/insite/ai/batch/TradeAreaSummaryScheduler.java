package com.ssafy.insite.ai.batch;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TradeAreaSummaryScheduler {
    private final JobLauncher jobLauncher;
    private final Job tradeAreaSummaryJob;

    // 매 분기(1, 4, 7, 10월) 1일 새벽 3시 실행
    @Scheduled(cron = "0 0 3 1 1,4,7,10 ?")
    public void runJob() throws Exception {
        JobParameters params = new JobParametersBuilder()
                .addLong("time", System.currentTimeMillis()) // 실행 구분 파라미터
                .toJobParameters();

        jobLauncher.run(tradeAreaSummaryJob, params);
    }
}
