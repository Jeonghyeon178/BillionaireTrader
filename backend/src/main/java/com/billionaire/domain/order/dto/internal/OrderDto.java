package com.billionaire.domain.order.dto.internal;

import com.billionaire.domain.order.type.OrderType;
import com.billionaire.global.constants.TradingConstants;
import com.billionaire.global.validation.annotation.ValidOrderQuantity;
import com.billionaire.global.validation.annotation.ValidTicker;
import com.billionaire.global.validation.annotation.ValidTradeAmount;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record OrderDto(
    @NotBlank(message = "{order.ticker.notBlank}")
    @ValidTicker
    String ticker, 
    
    @NotNull(message = "{order.quantity.notNull}")
    @ValidOrderQuantity(maxQuantity = 50_000) // 최대 5만주로 제한
    Integer quantity, 
    
    @NotNull(message = "{order.price.notNull}")
    @ValidTradeAmount(maxAmount = TradingConstants.Validation.ORDER_MAX_TRADE_AMOUNT) // 최대 5천만원으로 제한
    Double price, 
    
    @NotNull(message = "{order.orderType.notNull}")
    OrderType orderType
) {}
