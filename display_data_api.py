from flask import Flask, jsonify
from flask_cors import CORS
from db_connection import get_transactions, get_mas_critical_transactions_count

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/transactions')
def get_all_transactions():
    try:
        transactions = get_transactions()
        critical_count = get_mas_critical_transactions_count()
        
        return jsonify({
            'success': True,
            'data': transactions,
            'count': len(transactions),
            'summary': {
                'criticalCount': critical_count
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
if __name__ == '__main__':
    print("Starting API server...")
    print("API will be available at http://localhost:5000/api/transactions")
    app.run(debug=True, port=5000)
