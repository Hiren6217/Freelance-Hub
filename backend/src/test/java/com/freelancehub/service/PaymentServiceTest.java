package com.freelancehub.service;

import com.freelancehub.model.Contract;
import com.freelancehub.model.Payment;
import com.freelancehub.model.TimeLog;
import com.freelancehub.repository.MessageRepository;
import com.freelancehub.repository.NotificationRepository;
import com.freelancehub.repository.PaymentRepository;
import com.freelancehub.repository.TimeLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private TimeLogRepository timeLogRepository;
    @Mock private PayPalService payPalService;
    @Mock private NotificationRepository notificationRepository;
    @Mock private MessageRepository messageRepository;

    @InjectMocks private PaymentService paymentService;

    private static Contract contract(String billingType, String amount) {
        Contract c = new Contract();
        c.setId(1L);
        c.setClientId(10L);
        c.setDeveloperId(20L);
        c.setBillingType(billingType);
        c.setCurrency("USD");
        c.setAmount(new BigDecimal(amount));
        c.setTitle("Build the thing");
        return c;
    }

    @Test
    void createDueForProject_splitsGrossIntoFivePercentFee() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        paymentService.createDueForProject(contract("PROJECT", "1000.00"));

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        Payment p = captor.getValue();

        assertThat(p.getType()).isEqualTo("PROJECT");
        assertThat(p.getStatus()).isEqualTo("DUE");
        assertThat(p.getTimeLogId()).isNull();
        assertThat(p.getAmount()).isEqualByComparingTo("1000.00");
        assertThat(p.getPlatformFee()).isEqualByComparingTo("50.00");
        assertThat(p.getDeveloperEarnings()).isEqualByComparingTo("950.00");
        assertThat(p.getClientId()).isEqualTo(10L);
        assertThat(p.getDeveloperId()).isEqualTo(20L);
    }

    @Test
    void createDueForHour_multipliesRateByHours() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        TimeLog log = new TimeLog();
        log.setId(5L);
        log.setHours(new BigDecimal("2.5"));

        paymentService.createDueForHour(contract("HOURLY", "40.00"), log);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        Payment p = captor.getValue();

        assertThat(p.getType()).isEqualTo("HOURLY");
        assertThat(p.getStatus()).isEqualTo("DUE");
        assertThat(p.getTimeLogId()).isEqualTo(5L);
        // 2.5h * 40.00 = 100.00
        assertThat(p.getAmount()).isEqualByComparingTo("100.00");
        assertThat(p.getPlatformFee()).isEqualByComparingTo("5.00");
        assertThat(p.getDeveloperEarnings()).isEqualByComparingTo("95.00");
    }

    @Test
    void createDueForHour_defaultsToOneHourWhenUnset() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArgument(0));

        TimeLog log = new TimeLog();
        log.setId(7L);
        log.setHours(null);

        paymentService.createDueForHour(contract("HOURLY", "80.00"), log);

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("80.00");
    }

    @Test
    void computePlatformFee_isFivePercentRoundedToCents() {
        assertThat(PaymentService.computePlatformFee(new BigDecimal("33.33")))
            .isEqualByComparingTo("1.67"); // 1.6665 -> 1.67
    }
}
