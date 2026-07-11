from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from db_connection import get_transactions, get_critical_transactions_count, get_warning_transactions_count, get_normal_transactions_count
from db_connection import get_forApproval_transactions_count, get_Pending_transactions_count, get_ForAdditionalInput_transactions_count, get_Complete_transactions_count
from db_connection import get_all_transactions_list
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

@app.route('/api/normal-count')
def get_normal_count():
    """Dedicated endpoint for normal transaction count.

    Returns only the normal count.
    """
    try:
        normal_count = get_normal_transactions_count()

        return jsonify({
            'success': True,
            'normalCount': normal_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/forApproval-count')
def get_forApproval_count():
    """Dedicated endpoint for for-approval transaction count.

    Returns only the for-approval count.
    """
    try:
        forApproval_count = get_forApproval_transactions_count()

        return jsonify({
            'success': True,
            'forApprovalCount': forApproval_count
            
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/pending-count')
def get_pending_count():
    """Dedicated endpoint for pending transaction count.

    Returns only the pending count.
    """
    try:
        pending_count = get_Pending_transactions_count()

        return jsonify({
            'success': True,
            'pendingCount': pending_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/api/forAdditionalInput-count')
def get_forAdditionalInput_count():
    """Dedicated endpoint for for-additional-input transaction count.

    Returns only the for-additional-input count.
    """
    try:
        forAdditionalInput_count = get_ForAdditionalInput_transactions_count()

        return jsonify({
            'success': True,
            'forAdditionalInputCount': forAdditionalInput_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/completed-count')
def get_completed_count():
    """Dedicated endpoint for completed transaction count.

    Returns only the completed count.
    """
    try:
        completed_count = get_Complete_transactions_count()

        return jsonify({
            'success': True,
            'completedCount': completed_count
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/api/all_transactions_list')
def get_all_transactions_list_endpoint():
    """Dedicated endpoint for all transactions list.

    Returns the complete list of all transactions.
    """
    try:
        all_transactions_list = get_all_transactions_list()

        return jsonify({
            'success': True,
            'allTransactionList': all_transactions_list
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
    print("  - http://localhost:5000/api/normal-count (normal count only)")
    print("  - http://localhost:5000/api/forApproval-count (for-approval count only)")
    print("  - http://localhost:5000/api/pending-count (pending count only)")
    print("  - http://localhost:5000/api/forAdditionalInput-count (for-additional-input count only)")
    print("  - http://localhost:5000/api/completed-count (completed count only)")
    print("  - http://localhost:5000/api/all_transactions_list (all transactions list)")
    app.run(debug=True, port=5000)
