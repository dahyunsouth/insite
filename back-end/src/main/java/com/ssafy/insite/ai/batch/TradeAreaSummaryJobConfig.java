package com.ssafy.insite.ai.batch;

import com.ssafy.insite.ai.entity.TradeAreaSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class TradeAreaSummaryJobConfig {
    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    private final ItemReader<Integer> tradeAreaSummaryReader;
    private final ItemProcessor<Integer, TradeAreaSummary> tradeAreaSummaryProcessor;
    private final ItemWriter<TradeAreaSummary> tradeAreaSummaryWriter;

    @Bean
    public Job tradeAreaSummaryJob() {
        return new JobBuilder("tradeAreaSummaryJob", jobRepository)
                .start(tradeAreaSummaryStep())
                .build();
    }

    @Bean
    public Step tradeAreaSummaryStep() {
        return new StepBuilder("tradeAreaSummaryStep", jobRepository)
                .<Integer, TradeAreaSummary>chunk(10, transactionManager)
                .reader(tradeAreaSummaryReader)         // 1. findAllTrdarCd() 실행, 전체 상권코드 1650개 가져옴
                .processor(tradeAreaSummaryProcessor)   // 2. 각 상권별 GPT API 호출, TradeAreaSummary 엔티티 생성
                .writer(tradeAreaSummaryWriter)         // 3. 10개 단위(chunk=10)로 모아서 DB에 저장
                .build();
    }
}
