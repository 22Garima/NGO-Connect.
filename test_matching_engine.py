"""Small local smoke tests for the three NGOConnect matching directions.
Run after installing requirements: python -m unittest test_matching_engine.py
"""
import unittest

from app import load_ngos, rank_records


class MatchingEngineTests(unittest.TestCase):
    def test_ngo_to_provider_filters_unrelated_resource(self):
        request = {
            "type": "NGO", "resource": "Food", "quantity": "700",
            "location": "Noida", "urgency": "High",
            "additionalInfo": "Food packets for families",
        }
        candidates = [
            {"id": "food-1", "type": "Provider", "resource": "Food", "quantity": "1000",
             "location": "Noida", "availability": "Available", "additionalInfo": "Food and ration packets"},
            {"id": "med-1", "type": "Provider", "resource": "Medicines", "quantity": "1000",
             "location": "Noida", "availability": "Available", "additionalInfo": "Medical supplies"},
        ]
        matches = rank_records({"request": request, "candidates": candidates})
        self.assertEqual([item["id"] for item in matches], ["food-1"])
        self.assertGreater(matches[0]["matchScore"], 0)

    def test_provider_to_ngo_request_compares_offered_quantity(self):
        request = {
            "type": "Provider", "resource": "Food", "quantity": "1000",
            "location": "Noida", "availability": "Available",
            "additionalInfo": "Can provide food packets",
        }
        candidates = [
            {"id": "need-1", "type": "NGO", "resource": "Food", "quantity": "700",
             "location": "Noida", "urgency": "High", "additionalInfo": "Need food packets"},
        ]
        matches = rank_records({"request": request, "candidates": candidates})
        self.assertEqual(len(matches), 1)
        self.assertIn("Sufficient quantity available", matches[0]["reasons"])

    def test_individual_noida_education_recommends_local_education_ngos(self):
        request = {
            "type": "Individual", "helpType": "Education", "location": "Noida",
            "urgency": "High", "additionalInfo": "Need school and literacy support for a child",
        }
        matches = rank_records({"request": request, "candidates": list(load_ngos())})
        self.assertTrue(matches)
        self.assertTrue(all(item["state"] == "Uttar Pradesh" for item in matches))
        self.assertTrue(all(item["district"] == "GAUTAM BUDDHA NAGAR" for item in matches))
        self.assertTrue(any("Education" in item["focusAreas"] for item in matches))

    def test_ngo_directory_has_1000_rows(self):
        self.assertEqual(len(load_ngos()), 1000)


if __name__ == "__main__":
    unittest.main(verbosity=2)
