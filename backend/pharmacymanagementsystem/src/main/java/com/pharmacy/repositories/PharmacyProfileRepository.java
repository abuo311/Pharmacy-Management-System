package com.pharmacy.repositories;

import com.pharmacy.models.PharmacyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PharmacyProfileRepository extends JpaRepository<PharmacyProfile, Long> {
}