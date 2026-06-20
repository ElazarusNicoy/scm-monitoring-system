from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from db_connection import get_transactions, get_critical_transactions_count, get_warning_transactions_count
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def serve_index():
    """Serve the main HTML page."""
    return send_from_directory(BASE_DIR, 'workflow-tracking.html')

# @app.route('/script.js')
# def serve_script():
#     """Serve the JavaScript file."""
#     return send_from_directory(BASE_DIR, 'script.js', mimetype='application/javascript')

@app.route('/script_v2.js')
def serve_script_v2():
    """Serve the v2 JavaScript file."""
    return send_from_directory(BASE_DIR, 'script_v2.js', mimetype='application/javascript')

@app.route('/styles.css')
def serve_styles():
    """Serve the CSS file."""
    return send_from_directory(BASE_DIR, 'styles.css', mimetype='text/css')

@app.route('/api/transactions')
def get_all_transactions():
    try:
        transactions = get_transactions()
        # critical_count = get_mas_critical_transactions_count()
        
        return jsonify({
            'success': True,
            'data': transactions,
            'count': len(transactions),
            'summary': {
                'allTransactions': transactions
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/critical-count')
def get_critical_count():
    """Dedicated endpoint for critical transaction count.
    
    Returns only the critical count.
    """
    try:
        critical_count = get_critical_transactions_count()
        
        return jsonify({
            'success': True,
            'criticalCount': critical_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/warning-count')
def get_warning_count():
    """Dedicated endpoint for warning transaction count.

    Returns only the warning count.
    """
    try:
        warning_count = get_warning_transactions_count()

        return jsonify({
            'success': True,
            'warningCount': warning_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
if __name__ == '__main__':
    print("Starting API server...")
    print("Application will be available at http://localhost:5000")
    print("API endpoints:")
    print("  - http://localhost:5000/api/transactions (full data)")
    print("  - http://localhost:5000/api/critical-count (critical count only)")
    print("  - http://localhost:5000/api/warning-count (warning count only)")
    app.run(debug=True, port=5000)
