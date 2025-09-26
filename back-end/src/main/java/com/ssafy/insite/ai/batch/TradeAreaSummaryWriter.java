package com.ssafy.insite.ai.batch;

import com.ssafy.insite.ai.entity.TradeAreaSummary;
import com.ssafy.insite.ai.repository.TradeAreaSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;
import org.springframework.batch.item.Chunk;

@Component
@RequiredArgsConstructor
public class TradeAreaSummaryWriter implements ItemWriter<TradeAreaSummary> {
    private final TradeAreaSummaryRepository tradeAreaSummaryRepository;

    @Override
    public void write(Chunk<? extends TradeAreaSummary> chunk) {
        tradeAreaSummaryRepository.saveAll(chunk.getItems());
    }
}
