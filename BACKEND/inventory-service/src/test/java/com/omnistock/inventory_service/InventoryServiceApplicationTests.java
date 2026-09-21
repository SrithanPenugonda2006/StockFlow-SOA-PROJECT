package com.omnistock.inventory_service;

import com.omnistock.inventory_service.dto.StockReservationRequest;
import com.omnistock.inventory_service.entity.Inventory;
import com.omnistock.inventory_service.entity.Warehouse;
import com.omnistock.inventory_service.exception.InsufficientStockException;
import com.omnistock.inventory_service.repository.InventoryRepository;
import com.omnistock.inventory_service.repository.InventoryTransactionRepository;
import com.omnistock.inventory_service.repository.WarehouseRepository;
import com.omnistock.inventory_service.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Inventory inventory;
    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        warehouse = new Warehouse();
        warehouse.setId(1L);
        warehouse.setName("Main Warehouse");
        warehouse.setLocation("Hyderabad");

        inventory = new Inventory();
        inventory.setId(1L);
        inventory.setProductId(10L);
        inventory.setWarehouseId(1L);
        inventory.setQuantity(50);
        inventory.setReservedQuantity(0);
        inventory.setVersion(0L);
    }

    @Test
    void reserveStock_SufficientStock_ReservesSuccessfully() {
        StockReservationRequest request = new StockReservationRequest();
        request.setProductId(10L);
        request.setQuantity(5);
        request.setReferenceId("ORDER-1");
        request.setPerformedBy("customer1");

        when(inventoryRepository.findByProductId(10L)).thenReturn(List.of(inventory));
        when(inventoryRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any())).thenReturn(inventory);
        when(transactionRepository.save(any())).thenReturn(null);

        var result = inventoryService.reserveStock(request);

        assertThat(result).isNotNull();
        verify(inventoryRepository).save(inventory);
    }

    @Test
    void reserveStock_InsufficientStock_ThrowsException() {
        inventory.setQuantity(3);
        inventory.setReservedQuantity(0);

        StockReservationRequest request = new StockReservationRequest();
        request.setProductId(10L);
        request.setQuantity(5);

        when(inventoryRepository.findByProductId(10L)).thenReturn(List.of(inventory));

        assertThatThrownBy(() -> inventoryService.reserveStock(request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock for product: 10");
    }

    @Test
    void reserveStock_NoInventory_ThrowsException() {
        StockReservationRequest request = new StockReservationRequest();
        request.setProductId(99L);
        request.setQuantity(1);

        when(inventoryRepository.findByProductId(99L)).thenReturn(List.of());

        assertThatThrownBy(() -> inventoryService.reserveStock(request))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void confirmReservation_ReducesQuantityAndReserved() {
        inventory.setQuantity(50);
        inventory.setReservedQuantity(10);

        StockReservationRequest request = new StockReservationRequest();
        request.setProductId(10L);
        request.setQuantity(10);
        request.setReferenceId("ORDER-1");
        request.setPerformedBy("system");

        when(inventoryRepository.findByProductId(10L)).thenReturn(List.of(inventory));
        when(inventoryRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any())).thenReturn(inventory);
        when(transactionRepository.save(any())).thenReturn(null);

        var result = inventoryService.confirmReservation(request);

        assertThat(result).isNotNull();
        assertThat(inventory.getQuantity()).isEqualTo(40);
        assertThat(inventory.getReservedQuantity()).isEqualTo(0);
    }

    @Test
    void reserveStock_AllReserved_ThrowsException() {
        // All stock already reserved — available = 0
        inventory.setQuantity(10);
        inventory.setReservedQuantity(10);

        StockReservationRequest request = new StockReservationRequest();
        request.setProductId(10L);
        request.setQuantity(1);

        when(inventoryRepository.findByProductId(10L)).thenReturn(List.of(inventory));

        assertThatThrownBy(() -> inventoryService.reserveStock(request))
                .isInstanceOf(InsufficientStockException.class);
    }
}
