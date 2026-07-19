from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from db_connection import get_critical_transactions_count, get_warning_transactions_count, get_normal_transactions_count
from db_connection import get_forApproval_transactions_count, get_Pending_transactions_count, get_ForAdditionalInput_transactions_count, get_Complete_transactions_count
from db_connection import get_all_transactions_list, get_SLA_InformationDetails, get_all_transactions_workflow_progress
from db_connection import get_distinct_stages_from_all_transactions_list, get_distinct_transaction_types_from_all_transactions_list
from db_connection import get_distinct_current_pic_from_all_transactions_list
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def serve_index():
    """Serve the main HTML page."""
    return send_from_directory(BASE_DIR, 'workflow-tracking.html')

@app.route('/script.js')
def serve_script():
    """Serve the JavaScript file."""
    return send_from_directory(BASE_DIR, 'script.js', mimetype='application/javascript')

@app.route('/styles.css')
def serve_styles():
    """Serve the CSS file."""
    return send_from_directory(BASE_DIR, 'styles.css', mimetype='text/css')

# @app.route('/api/transactions')
# def get_all_transactions():
#     try:
#         transactions = get_transactions()
        
#         return jsonify({
#             'success': True,
#             'data': transactions,
#             'count': len(transactions),
#             'summary': {
#                 'allTransactions': transactions
#             }
#         })
#     except Exception as e:
#         return jsonify({
#             'success': False,
#             'error': str(e)
#         }), 500

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
    
@app.route('/api/sla_information_details')
def get_sla_information_details_endpoint():
    """Dedicated endpoint for SLA information details.

    Returns the SLA information details.
    """
    try:
        sla_information_details = get_SLA_InformationDetails()

        return jsonify({
            'success': True,
            'slaInformationDetails': sla_information_details
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/all_transactions_workflow_progress')
def get_all_transactions_workflow_progress_endpoint():
    try:
        workflow_progress = get_all_transactions_workflow_progress()

        print(f"Workflow rows returned: {len(workflow_progress)}") 

        return jsonify({
            'success': True,
            'allTransactionsWorkflowProgress': workflow_progress  
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/distinct-stages')
def get_distinct_stages():
    """Dedicated endpoint for distinct stages.

    Returns a list of distinct stages from all transactions.
    """
    try:
        distinct_stages = get_distinct_stages_from_all_transactions_list()

        return jsonify({
            'success': True,
            'distinctStages': distinct_stages
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/distinct-transaction-types')
def get_distinct_transaction_types():
    """Dedicated endpoint for distinct transaction types.

    Returns a list of distinct transaction types from all transactions.
    """
    try:
        distinct_transaction_types = get_distinct_transaction_types_from_all_transactions_list()

        return jsonify({
            'success': True,
            'distinctTransactionTypes': distinct_transaction_types
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/distinct-current-pics')
def get_distinct_current_pics():
    """Dedicated endpoint for distinct current PICs.

    Returns a list of distinct current PICs from all transactions.
    """
    try:
        distinct_current_pics = get_distinct_current_pic_from_all_transactions_list()

        return jsonify({
            'success': True,
            'distinctCurrentPICs': distinct_current_pics
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
    print("  - http://localhost:5000/api/critical-count (critical count only)")
    print("  - http://localhost:5000/api/warning-count (warning count only)")
    print("  - http://localhost:5000/api/normal-count (normal count only)")
    print("  - http://localhost:5000/api/forApproval-count (for-approval count only)")
    print("  - http://localhost:5000/api/pending-count (pending count only)")
    print("  - http://localhost:5000/api/forAdditionalInput-count (for-additional-input count only)")
    print("  - http://localhost:5000/api/completed-count (completed count only)")
    print("  - http://localhost:5000/api/all_transactions_list (all transactions list)")
    print("  - http://localhost:5000/api/sla_information_details (SLA information details)")
    print("  - http://localhost:5000/api/all_transactions_workflow_progress (all transactions workflow progress)")
    print("  - http://localhost:5000/api/distinct-stages (distinct stages)")
    print("  - http://localhost:5000/api/distinct-transaction-types (distinct transaction types)")
    print("  - http://localhost:5000/api/distinct-current-pics (distinct current PICs)")

    app.run(debug=True, port=5000)
