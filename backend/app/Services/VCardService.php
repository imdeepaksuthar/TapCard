<?php

namespace App\Services;

use App\Models\BusinessCard;

class VCardService
{
    /**
     * Generate standard .vcf format string mapping to Apple and Android contacts.
     *
     * @param BusinessCard $card
     * @return string
     */
    public function generateVCard(BusinessCard $card): string
    {
        $personalInfo = $card->personal_info ?? [];
        $contactButtons = $card->contact_buttons ?? [];
        $companyDetails = $card->company_details ?? [];
        $socialLinks = $card->social_links ?? [];

        $firstName = $personalInfo['name'] ?? 'User';
        $lastName = '';
        if (strpos($firstName, ' ') !== false) {
            $parts = explode(' ', $firstName, 2);
            $firstName = $parts[0];
            $lastName = $parts[1];
        }

        $vcard = "BEGIN:VCARD\r\n";
        $vcard .= "VERSION:3.0\r\n";
        $vcard .= "N:{$lastName};{$firstName};;;\r\n";
        $vcard .= "FN:{$personalInfo['name']}\r\n";
        
        if (!empty($personalInfo['company'])) {
            $vcard .= "ORG:{$personalInfo['company']}\r\n";
        }
        
        if (!empty($personalInfo['designation'])) {
            $vcard .= "TITLE:{$personalInfo['designation']}\r\n";
        }
        
        if (!empty($contactButtons['call'])) {
            $vcard .= "TEL;TYPE=WORK,VOICE:{$contactButtons['call']}\r\n";
        }
        
        if (!empty($contactButtons['whatsapp'])) {
            $vcard .= "TEL;TYPE=CELL,VOICE:{$contactButtons['whatsapp']}\r\n";
        }
        
        if (!empty($contactButtons['email'])) {
            $vcard .= "EMAIL;TYPE=PREF,INTERNET:{$contactButtons['email']}\r\n";
        }

        if (!empty($companyDetails['address'])) {
            $vcard .= "ADR;TYPE=WORK:;;{$companyDetails['address']};;;;\r\n";
        }

        // Add Social Links as URLs
        foreach ($socialLinks as $platform => $url) {
            if (!empty($url)) {
                $vcard .= "URL;type={$platform}:{$url}\r\n";
            }
        }

        if (!empty($personalInfo['bio'])) {
            $vcard .= "NOTE:{$personalInfo['bio']}\r\n";
        }
        
        $vcard .= "END:VCARD\r\n";

        return $vcard;
    }
}
