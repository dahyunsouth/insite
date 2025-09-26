package com.ssafy.insite;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class InsiteApplication {
	private final JobLauncher jobLauncher;
	private final Job tradeAreaSummaryJob;

	public InsiteApplication(JobLauncher jobLauncher, Job tradeAreaSummaryJob) {
		this.jobLauncher = jobLauncher;
		this.tradeAreaSummaryJob = tradeAreaSummaryJob;
	}

	public static void main(String[] args) {
		SpringApplication.run(InsiteApplication.class, args);
	}

	@Bean
	public ApplicationRunner runner() {
		return args -> {
			JobParameters params = new JobParametersBuilder()
					.addLong("time", System.currentTimeMillis()) // 매번 유니크 파라미터 필요
					.toJobParameters();

			jobLauncher.run(tradeAreaSummaryJob, params);
		};
	}
}
