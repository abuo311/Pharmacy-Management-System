package com.pharmacy.services;

import com.pharmacy.models.*;
import com.pharmacy.repositories.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class MedicineImportService {

    @Autowired
    private MedicineRepository medicineRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private BranchRepository branchRepository;
    @Autowired
    private SupplierRepository supplierRepository;

    public void importMedicines(MultipartFile file) throws Exception {
        BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
        CSVParser csvParser = new CSVParser(fileReader,
                CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim());

        List<Medicine> medicines = new ArrayList<>();
        Iterable<CSVRecord> csvRecords = csvParser.getRecords();

        for (CSVRecord record : csvRecords) {
            // Find foreign keys by Name
            Category category = categoryRepository.findByName(record.get("category_name"))
                    .orElseThrow(() -> new RuntimeException("Category not found: " + record.get("category_name")));

            Branch branch = branchRepository.findByName(record.get("branch_name"))
                    .orElseThrow(() -> new RuntimeException("Branch not found: " + record.get("branch_name")));

            // Inside the for loop in MedicineImportService.java
            Supplier supplier = supplierRepository.findByCompanyName(record.get("supplier_name"))
                    .orElse(null);

            Medicine med = Medicine.builder()
                    .name(record.get("name"))
                    .manufacturer(record.get("manufacturer"))
                    .expiryDate(LocalDate.parse(record.get("expiry_date")))
                    .price(new BigDecimal(record.get("price")))
                    .sellingPrice(new BigDecimal(record.get("selling_price")))
                    .stockLevel(Integer.parseInt(record.get("stock_level")))
                    .minAlertLevel(Integer.parseInt(record.get("min_alert_level")))
                    .prescriptionRequired(record.get("prescription_required").equals("1"))
                    .shelfLocation(record.get("shelf_location"))
                    .category(category)
                    .branch(branch)
                    .supplier(supplier)
                    .build();

            medicines.add(med);
        }
        medicineRepository.saveAll(medicines);
    }
}