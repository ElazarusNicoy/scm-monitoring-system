import os
from flask import (
    Flask, 
    jsonify, 
    send_from_directory,
    request, 
    session, 
    render_template, 
    redirect, 
    url_for
)
from flask_cors import CORS

from app.utils.email_sender import send_escalation_email

from app.db_connection import (
    get_critical_transactions_count,
    get_warning_transactions_count,
    get_normal_transactions_count,
    get_forApproval_transactions_count,
    get_Pending_transactions_count,
    get_ForAdditionalInput_transactions_count,
    get_Complete_transactions_count,
    get_all_transactions_list,
    get_SLA_InformationDetails,
    get_all_transactions_workflow_progress,
    get_distinct_stages_from_all_transactions_list,
    get_distinct_transaction_types_from_all_transactions_list,
    get_distinct_current_pic_from_all_transactions_list,
    get_distinct_current_pic_from_warningCrit_transactions_list,
    get_newly_warningCriticalTransactions,
    get_escalation_log,
    get_escalation_transactions,
    get_transactions_newly_aged,
    log_escalation_email,
    authenticate_user,
    display_current_user_responsibilities
    )

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))   

app = Flask(
    __name__,
    template_folder=os.path.join(PROJECT_ROOT, 'templates'),
    static_folder=os.path.join(PROJECT_ROOT, 'static')

)

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret')

CORS(app)  # Enable CORS for all routes
@app.route('/')
def index():
    """Show login page."""
    return render_template('login.html')

@app.route('/workflow-tracking')
def workflow_tracking():
    return render_template('workflow-tracking.html')

# @app.route('/script.js')
# def serve_script():
#     """Serve the JavaScript file."""
#     return send_from_directory(BASE_DIR, 'script.js', mimetype='application/javascript')

# @app.route('/styles.css')
# def serve_styles():
#     """Serve the CSS file."""
#     return send_from_directory(BASE_DIR, 'styles.css', mimetype='text/css')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    user = authenticate_user(username, password)
    if user:
        session['user'] = {'pk_id': user['pk_id'], 'username': user['username']}
        return jsonify({'success': True, 'user': session['user']})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/api/current-user', methods=['GET'])
def api_current_user():
    user = session.get('user')
    if user:
        return jsonify({'success': True, 'user': user})
    return jsonify({'success': False, 'message': 'No user logged in'}), 401


@app.route('/api/my-responsibilities')
def get_my_responsibilities():
    """
    Return transactions where the current session user is Current PIC or Requestor.
    Client should call this after successful login (session must be set).
    """
    user = session.get('user')
    if not user:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401

    current_user = user.get('username')
    try:
        rows = display_current_user_responsibilities(current_user)
        return jsonify({'success': True, 'responsibilities': rows, 'count': len(rows)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

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

@app.route('/api/distinct-current-pics-warning-critical')
def get_distinct_current_pics_warning_critical():
    """Dedicated endpoint for distinct current PICs for warning and critical transactions.
    """
    try:
        distinct_current_pics_warningCrit = get_distinct_current_pic_from_warningCrit_transactions_list()

        return jsonify({
            'success': True,
            'distinctCurrentPICsWarningCrit': distinct_current_pics_warningCrit
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/api/escalation-transactions')
def get_escalation_transactions_endpoint():
    """Returns only Warning and Critical transactions for the Escalation module."""
    try:
        transactions = get_escalation_transactions()
        return jsonify({
            'success': True,
            'escalationTransactions': transactions,
            'count': len(transactions)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/send-followup-email', methods=['POST'])
def send_followup_email():
    """
    Manual follow-up email triggered by user clicking Follow Up button.
    To: Current PIC | CC: Requestor
    """
    try:
        data = request.get_json()

        transaction_name  = data.get('transactionName')
        transaction_type  = data.get('transactionType')
        aging_days        = data.get('agingDays')
        aging_level       = data.get('agingLevel')
        current_pic       = data.get('currentPIC')
        requestor         = data.get('requestor')
        pic_email         = data.get('currentPICEmail')
        requestor_email   = data.get('requestorEmail')
        sharepoint_link   = data.get('sharePointLink', '#')
        #sent_by           = data.get('sentBy', 'SYSTEM')

        # ✅ Use default test email for both To and CC during system testing
        DEFAULT_EMAIL = os.getenv('DEFAULT_ESCALATION_EMAIL', 'nj.aguisanda21@gmail.com')
        pic_email      = data.get('currentPICEmail') or DEFAULT_EMAIL
        requestor_email = data.get('requestorEmail') or DEFAULT_EMAIL
        subject = f"[Follow Up] {transaction_name} — {aging_level.upper()} ({aging_days} days)"

        success = send_escalation_email(
            to_email         = pic_email,
            cc_email         = requestor_email,
            subject          = subject,
            transaction_name = transaction_name,
            transaction_type = transaction_type,
            aging_days       = aging_days,
            aging_level      = aging_level,
            current_pic      = current_pic,
            requestor        = requestor,
            sharepoint_link  = sharepoint_link
        )

        if success:
            log_escalation_email(
                transaction_number = transaction_name,
                transaction_type   = transaction_type,
                escalation_type    = aging_level.lower(),
                email_to           = pic_email,
                email_cc           = requestor_email,
                sent_type          = 'manual',
                sent_by            = 'USER'
            )
            return jsonify({'success': True, 'message': f'Follow-up email sent to {pic_email}.'})
        else:
            return jsonify({'success': False, 'error': 'Email failed to send.'}), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/check-auto-escalation', methods=['POST'])
def check_auto_escalation():
    """
    Checks for transactions on their FIRST DAY as Warning or Critical.
    Sends automated email and logs it — will NOT re-send on subsequent days.
    Call this endpoint on page load or on a schedule.
    """
    try:
        newly_aged = get_transactions_newly_aged()
        sent_count = 0

        for t in newly_aged:
            subject = (
                f"[SCM Alert] {t['transactionNumber']} has reached "
                f"{t['agingLevel'].upper()} aging ({t['agingDays']} days)"
            )

            success = send_escalation_email(
                to_email         = t['currentPICEmail'],
                cc_email         = t['requestorEmail'],
                subject          = subject,
                transaction_name = t['transactionNumber'],
                transaction_type = t['transactionType'],
                aging_days       = t['agingDays'],
                aging_level      = t['agingLevel'],
                current_pic      = t['currentPIC'],
                requestor        = t['requestor'],
                sharepoint_link  = t.get('sharePointLink', '#')
            )

            if success:
                log_escalation_email(
                    transaction_number = t['transactionNumber'],
                    transaction_type   = t['transactionType'],
                    escalation_type    = t['agingLevel'].lower(),
                    email_to           = t['currentPICEmail'],
                    email_cc           = t['requestorEmail'],
                    sent_type          = 'auto',
                    sent_by            = 'SYSTEM'
                )
                sent_count += 1

        return jsonify({
            'success': True,
            'autoEmailsSent': sent_count,
            'message': f'{sent_count} automated escalation email(s) dispatched.'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/escalation-log')
def get_escalation_log_endpoint():
    """Returns the full escalation email log."""
    try:
        logs = get_escalation_log()
        return jsonify({'success': True, 'escalationLog': logs})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/newly-aged-transactions')
def get_newly_aged_transactions_endpoint():
    """
    Returns transactions that just reached Warning or Critical threshold TODAY.
    These are candidates for automatic follow-up emails.
    """
    try:
        newly_aged = get_newly_warningCriticalTransactions()
        return jsonify({
            'success': True,
            'newlyAgedTransactions': newly_aged,
            'count': len(newly_aged)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

    
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
    print("  - http://localhost:5000/api/distinct-current-pics-warning-critical (distinct current PICs for warning and critical transactions)")
    print("  - http://localhost:5000/api/escalation-log (escalation log)")
    print("  - http://localhost:5000/api/newly-aged-transactions (newly warning/critical transactions)")
    print("  - http://localhost:5000/api/my-responsibilities (transactions where current user is Current PIC or Requestor)")
    app.run(debug=True, port=5000)
