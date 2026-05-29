package com.pharmacy.services;

import com.pharmacy.models.PharmacySetting;
import com.pharmacy.repositories.PharmacySettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PharmacySettingService {

    private final PharmacySettingRepository settingsRepository;

    public PharmacySetting getSettings() {
        return settingsRepository.findGlobalSettings()
                .orElse(PharmacySetting.builder()
                        .pharmacyName("PharmaWeb System")
                        .contactEmail("info@pharmaweb.com")
                        .phoneNumber("+233 00 000 0000")
                        .addressLocation("Ghana, West Africa")
                        .currencySymbol("GHS")
                        .motto("Your Health, Our Priority")
                        .workingDays("Monday - Sunday")
                        .workingHours("24/7 Service")
                        .logoData("")
                        .build());
    }

    @Transactional
    public PharmacySetting updateSettings(PharmacySetting incomingData) {
        PharmacySetting existing = settingsRepository.findGlobalSettings()
                .orElse(new PharmacySetting());

        existing.setPharmacyName(incomingData.getPharmacyName());
        existing.setContactEmail(incomingData.getContactEmail());
        existing.setPhoneNumber(incomingData.getPhoneNumber());
        existing.setAddressLocation(incomingData.getAddressLocation());
        existing.setTaxIdentificationNumber(incomingData.getTaxIdentificationNumber());
        existing.setCurrencySymbol(incomingData.getCurrencySymbol());
        existing.setLogoData(incomingData.getLogoData());

        // Map new text field variables
        existing.setMotto(incomingData.getMotto());
        existing.setWorkingDays(incomingData.getWorkingDays());
        existing.setWorkingHours(incomingData.getWorkingHours());

        return settingsRepository.save(existing);
    }
}