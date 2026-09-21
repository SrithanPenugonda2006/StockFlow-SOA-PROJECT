package com.omnistock.inventory_service.controller;

import com.omnistock.inventory_service.dto.BatchDTO;
import com.omnistock.inventory_service.service.BatchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/batches")
public class BatchController {

    @Autowired
    private BatchService batchService;

    @GetMapping
    public ResponseEntity<List<BatchDTO>> getBatches(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(batchService.getAllBatches(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BatchDTO> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    @PostMapping
    public ResponseEntity<BatchDTO> createBatch(@Valid @RequestBody BatchDTO batchDTO) {
        BatchDTO created = batchService.createBatch(batchDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BatchDTO> updateBatch(
            @PathVariable Long id,
            @Valid @RequestBody BatchDTO batchDTO) {
        return ResponseEntity.ok(batchService.updateBatch(id, batchDTO));
    }
}
