package com.pharmacy.repositories;

import com.pharmacy.models.PharmacySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface PharmacySettingRepository extends JpaRepository<PharmacySetting, Long> {
    // Always fetch the first configuration profile setup row
    @Query("SELECT p FROM PharmacySetting p ORDER BY p.id ASC LIMIT 1")
    Optional<PharmacySetting> findGlobalSettings();
}