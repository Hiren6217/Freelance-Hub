package com.freelancehub.service;

import com.freelancehub.model.Payment;
import com.freelancehub.model.User;
import com.freelancehub.repository.PaymentRepository;
import com.freelancehub.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentEnforcementServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private PaymentEnforcementService enforcementService;

    private static User client(long id, String status) {
        User u = new User();
        u.setId(id);
        u.setRole("CLIENT");
        u.setAccountStatus(status);
        u.setEmailVerified(true);
        return u;
    }

    private static Payment due(long clientId) {
        Payment p = new Payment();
        p.setClientId(clientId);
        p.setStatus("DUE");
        p.setDueAt(LocalDateTime.now().minusMinutes(1));
        return p;
    }

    @Test
    void suspendsActiveClientWithOverdueDuePayment() {
        when(paymentRepository.findByStatusInAndDueAtBefore(anyList(), any()))
            .thenReturn(List.of(due(10L)));
        when(userRepository.findById(10L)).thenReturn(Optional.of(client(10L, "ACTIVE")));
        // no suspended users to reactivate
        when(userRepository.findByAccountStatus("SUSPENDED")).thenReturn(List.of());

        enforcementService.enforce();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getAccountStatus()).isEqualTo("SUSPENDED");
        assertThat(saved.getSuspendedAt()).isNotNull();
        assertThat(saved.getSuspendReason()).isNotBlank();
    }

    @Test
    void reactivatesSuspendedClientOnceDuesCleared() {
        when(paymentRepository.findByStatusInAndDueAtBefore(anyList(), any())).thenReturn(List.of());
        when(userRepository.findByAccountStatus("SUSPENDED"))
            .thenReturn(List.of(client(10L, "SUSPENDED")));
        when(paymentRepository.existsByClientIdAndStatusIn(eq(10L), anyList())).thenReturn(false);

        enforcementService.enforce();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getAccountStatus()).isEqualTo("ACTIVE");
        assertThat(saved.getSuspendedAt()).isNull();
        assertThat(saved.getSuspendReason()).isNull();
    }

    @Test
    void doesNotReactivateWhileDuesRemain() {
        when(paymentRepository.findByStatusInAndDueAtBefore(anyList(), any())).thenReturn(List.of());
        when(userRepository.findByAccountStatus("SUSPENDED"))
            .thenReturn(List.of(client(10L, "SUSPENDED")));
        when(paymentRepository.existsByClientIdAndStatusIn(eq(10L), anyList())).thenReturn(true);

        enforcementService.enforce();

        verify(userRepository, never()).save(any());
    }
}
