package com.ssafy.insite.ai.batch;

import com.ssafy.insite.data.repository.TradeAreaRegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class TradeAreaSummaryReaderConfig {
    private final TradeAreaRegionRepository tradeAreaRegionRepository;

    @Bean
    public ItemReader<Integer> tradeAreaSummaryReader() {
        List<Integer> trdarCds = tradeAreaRegionRepository.findAllTrdarCd();
        return new ListItemReader<>(trdarCds);
    }
}
