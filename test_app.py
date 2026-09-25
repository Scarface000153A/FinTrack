import unittest
import json
from app import app, convert_amount, get_exchange_rates
from database import init_db, get_db

class FinanceTrackerTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test_secret_key'
        self.client = app.test_client()
        init_db()
        # Clean test tables for repeatable test runs
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM transactions;")
            cursor.execute("DELETE FROM users;")

    def test_currency_conversion_math(self):
        rates = get_exchange_rates()
        inr_rate = rates.get('INR', 83.5)
        
        # 100 USD to INR
        expected_inr = round(100.0 * inr_rate, 2)
        self.assertEqual(convert_amount(100, 'USD', 'INR'), expected_inr)
        
        # Converted INR back to USD
        self.assertEqual(convert_amount(expected_inr, 'INR', 'USD'), 100.0)
        
        # Same currency
        self.assertEqual(convert_amount(500, 'EUR', 'EUR'), 500.0)

    def test_landing_page_and_dashboard_routing(self):
        # 1. Unauthenticated guest visiting '/' should see the SaaS landing page
        res = self.client.get('/')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Track Personal Income, Expenses', res.data)
        self.assertIn(b'FinTrack', res.data)

        # 2. Unauthenticated guest visiting '/dashboard' should be redirected to login
        res = self.client.get('/dashboard')
        self.assertEqual(res.status_code, 302)
        self.assertTrue(res.location.endswith('/login'))

        # 3. Register and Login
        self.client.post('/register', data={
            'full_name': 'Test User',
            'username': 'tester',
            'email': 'tester@test.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'currency': 'USD'
        }, follow_redirects=True)

        self.client.post('/login', data={
            'username_or_email': 'tester',
            'password': 'password123'
        }, follow_redirects=True)

        # 4. Authenticated user visiting '/' should be redirected to '/dashboard'
        res = self.client.get('/')
        self.assertEqual(res.status_code, 302)
        self.assertTrue(res.location.endswith('/dashboard'))

        # 5. Accessing '/dashboard' directly renders the dashboard
        res = self.client.get('/dashboard')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'Personal Finance Dashboard', res.data)

    def test_terms_and_privacy_pages(self):
        # Terms and conditions page
        res_terms = self.client.get('/terms')
        self.assertEqual(res_terms.status_code, 200)
        self.assertIn(b'Terms and Conditions', res_terms.data)
        self.assertIn(b'Acceptance of Terms', res_terms.data)
        self.assertIn(b'Financial Disclaimer', res_terms.data)

        # Privacy policy page
        res_privacy = self.client.get('/privacy')
        self.assertEqual(res_privacy.status_code, 200)
        self.assertIn(b'Privacy Policy', res_privacy.data)
        self.assertIn(b'Information We Collect', res_privacy.data)
        self.assertIn(b'Data Protection', res_privacy.data)

    def test_no_em_dashes_or_ai_branding(self):
        # Verify rendered public pages do not contain em dashes or "FinTrack.ai"
        for endpoint in ['/', '/terms', '/privacy', '/login', '/register']:
            res = self.client.get(endpoint)
            html_text = res.data.decode('utf-8', errors='ignore')
            self.assertNotIn('\u2014', html_text, f"Em dash found in {endpoint}")
            self.assertNotIn('&mdash;', html_text, f"&mdash; found in {endpoint}")
            self.assertNotIn('FinTrack.ai', html_text, f"FinTrack.ai branding found in {endpoint}")
            self.assertNotIn('made with AI', html_text.lower(), f"Made with AI tag found in {endpoint}")

    def test_favicon_accessible(self):
        res = self.client.get('/static/favicon.svg')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.content_type.startswith('image/svg+xml'))

    def test_full_user_flow_with_currency_conversion(self):
        rates = get_exchange_rates()
        inr_rate = rates.get('INR', 83.5)

        # 1. Register User 1 (Alice) with INR currency
        res = self.client.post('/register', data={
            'full_name': 'Alice Smith',
            'username': 'alice',
            'email': 'alice@test.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'currency': 'INR'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)

        # 2. Login as Alice
        res = self.client.post('/login', data={
            'username_or_email': 'alice',
            'password': 'password123'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)

        # 3. Add Income in INR (10,000 INR)
        res = self.client.post('/transactions/add', data={
            'type': 'income',
            'amount': '10000.00',
            'category': 'Salary',
            'description': 'Consulting Fee',
            'date': '2026-09-01'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'10000.00', res.data)

        # 4. Switch currency from INR to USD
        res = self.client.post('/settings/currency', data={
            'currency': 'USD'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        expected_usd_str = f"{round(10000.0 / inr_rate, 2):.2f}".encode()
        self.assertIn(expected_usd_str, res.data)
        self.assertIn(b'USD', res.data)

        # 5. Add Expense in USD ($50 USD)
        res = self.client.post('/transactions/add', data={
            'type': 'expense',
            'amount': '50.00',
            'category': 'Shopping',
            'description': 'Software License',
            'date': '2026-09-02'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)

        # 6. Switch currency back to INR
        res = self.client.post('/settings/currency', data={
            'currency': 'INR'
        }, follow_redirects=True)
        self.assertEqual
                # 6. Switch currency back to INR
        res = self.client.post('/settings/currency', data={
            'currency': 'INR'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)
        
        # 7. Check chart data API returns converted amounts
        res = self.client.get('/api/chart-data')
        self.assertEqual(res.status_code, 200)
        chart_json = res.get_json()
        self.assertEqual(chart_json['currency'], 'INR')

    def test_export_csv_and_json(self):
        # Register and login
        self.client.post('/register', data={
            'full_name': 'Exporter',
            'username': 'exporter',
            'email': 'export@test.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'currency': 'USD'
        }, follow_redirects=True)

        self.client.post('/login', data={
            'username_or_email': 'exporter',
            'password': 'password123'
        }, follow_redirects=True)

        # Add transaction
        self.client.post('/transactions/add', data={
            'type': 'income',
            'amount': '1500.00',
            'category': 'Freelance',
            'description': 'Web Dev Project',
            'date': '2026-09-05'
        }, follow_redirects=True)

        # Test CSV Export
        csv_res = self.client.get('/export/csv')
        self.assertEqual(csv_res.status_code, 200)
        self.assertEqual(csv_res.content_type, 'text/csv; charset=utf-8')
        self.assertIn(b'Web Dev Project', csv_res.data)
        self.assertIn(b'1500.0', csv_res.data)
        self.assertIn(b'Freelance', csv_res.data)

        # Test JSON Export
        json_res = self.client.get('/export/json')
        self.assertEqual(json_res.status_code, 200)
        self.assertEqual(json_res.content_type, 'application/json')
        payload = json.loads(json_res.data)
        self.assertEqual(payload['user']['username'], 'exporter')
        self.assertEqual(len(payload['transactions']), 1)
        self.assertEqual(payload['transactions'][0]['description'], 'Web Dev Project')

    def test_user_isolation(self):
        # Register User 1 (Alice)
        self.client.post('/register', data={
            'full_name': 'Alice User',
            'username': 'alice_iso',
            'email': 'alice_iso@test.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'currency': 'USD'
        }, follow_redirects=True)

        self.client.post('/login', data={
            'username_or_email': 'alice_iso',
            'password': 'password123'
        }, follow_redirects=True)

        self.client.post('/transactions/add', data={
            'type': 'income',
            'amount': '9999.00',
            'category': 'Salary',
            'description': 'Alice Secret Salary',
            'date': '2026-09-01'
        }, follow_redirects=True)

        self.client.get('/logout', follow_redirects=True)

        # Register and login as User 2 (Bob)
        self.client.post('/register', data={
            'full_name': 'Bob User',
            'username': 'bob_iso',
            'email': 'bob_iso@test.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'currency': 'USD'
        }, follow_redirects=True)

        self.client.post('/login', data={
            'username_or_email': 'bob_iso',
            'password': 'password123'
        }, follow_redirects=True)

        # Bob's dashboard should have zero records and not mention Alice's salary
        res = self.client.get('/dashboard')
        self.assertNotIn(b'Alice Secret Salary', res.data)
        self.assertNotIn(b'9999.00', res.data)
        self.assertIn(b'0 Records', res.data)

    def test_session_persistence_and_cleanup(self):
        # 1. Register user
        res = self.client.post('/register', data={
            'full_name': 'Persistent User',
            'username': 'persistent',
            'email': 'persist@test.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'currency': 'USD'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)

        # Verify session is permanent and dashboard is accessible
        with self.client.session_transaction() as sess:
            self.assertTrue(sess.permanent)
            self.assertEqual(sess['username'], 'persistent')

        # 2. Simulate database wipe / stale user ID
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users;")

        # Visiting dashboard with a stale session should cleanly redirect to login
        res = self.client.get('/dashboard', follow_redirects=False)
        self.assertEqual(res.status_code, 302)
        self.assertTrue(res.location.endswith('/login'))

        # Session should be wiped cleanly
        with self.client.session_transaction() as sess:
            self.assertNotIn('user_id', sess)

if __name__ == '__main__':
    unittest.main()