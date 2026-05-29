package com.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryStatsDTO {
    private Long id;
    private String name;
    private String color;
    private long productCount;
}