package com.omnistock.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;

public class WarehouseDTO {
    private Long id;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    private String code;
    private String address;
    private String city;
    private String state;
    private String country;
    private Integer totalCapacity = 10000;
    private Integer occupiedCapacity = 0;
    private String status = "ACTIVE";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Integer getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(Integer totalCapacity) { this.totalCapacity = totalCapacity; }

    public Integer getCapacity() { return totalCapacity; }
    public void setCapacity(Integer capacity) {
        if (capacity != null) {
            this.totalCapacity = capacity;
        }
    }

    public Integer getOccupiedCapacity() { return occupiedCapacity; }
    public void setOccupiedCapacity(Integer occupiedCapacity) { this.occupiedCapacity = occupiedCapacity; }

    public Integer getUsedCapacity() { return occupiedCapacity; }
    public void setUsedCapacity(Integer usedCapacity) { this.occupiedCapacity = usedCapacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

