import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Modal, Form, Alert, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../slices/groups/thunk';
import { fetchExpenses, addNewExpense } from '../../slices/expenses/thunk';
import { RootState } from '../../slices';
import { PlusCircle, Receipt, Users, CreditCard, Trash2 } from 'lucide-react';
import DashboardAnalytics from './DashboardAnalytics';
import { post } from '../../helpers/api_helper';
import { POST_INVITE, POST_SETTLEMENT } from '../../helpers/url_helper';

const GroupDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { groupDetail, loading: groupLoading } = useSelector((state: RootState) => state.Group);
  const { expenses, loading: expenseLoading, error: expenseError } = useSelector((state: RootState) => state.Expense);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseItems, setExpenseItems] = useState([{ name: '', quantity: '1', amount: '' }]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [settlementMessage, setSettlementMessage] = useState('');

  const members = groupDetail.members || [];
  const expenseTotal = expenseItems.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const amount = parseFloat(item.amount) || 0;
    return sum + quantity * amount;
  }, 0);

  useEffect(() => {
    if (id) {
      dispatch(fetchGroupDetail(id) as any);
      dispatch(fetchExpenses(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!showExpenseModal && members.length > 0 && selectedParticipantIds.length === 0) {
      setSelectedParticipantIds(members.map((member: any) => String(member.id)));
    }
  }, [members, selectedParticipantIds.length, showExpenseModal]);

  const resetExpenseForm = () => {
    setShowExpenseModal(false);
    setExpenseTitle('');
    setExpenseItems([{ name: '', quantity: '1', amount: '' }]);
    setSelectedParticipantIds(members.map((member: any) => String(member.id)));
  };

  const handleShowExpenseModal = () => {
    setSelectedParticipantIds(members.map((member: any) => String(member.id)));
    setShowExpenseModal(true);
  };

  const handleExpenseItemChange = (index: number, field: string, value: string) => {
    setExpenseItems((items) => items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const handleAddExpenseItem = () => {
    setExpenseItems((items) => [...items, { name: '', quantity: '1', amount: '' }]);
  };

  const handleRemoveExpenseItem = (index: number) => {
    setExpenseItems((items) => items.length === 1 ? items : items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleParticipantToggle = (memberId: string) => {
    setSelectedParticipantIds((ids) => (
      ids.includes(memberId) ? ids.filter((id) => id !== memberId) : [...ids, memberId]
    ));
  };

  const handleSelectAllParticipants = (checked: boolean) => {
    setSelectedParticipantIds(checked ? members.map((member: any) => String(member.id)) : []);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = expenseItems
      .filter((item) => item.name.trim() && parseFloat(item.amount) > 0)
      .map((item) => ({
        name: item.name.trim(),
        quantity: parseFloat(item.quantity) || 1,
        amount: parseFloat(item.amount)
      }));

    if (id && validItems.length > 0 && selectedParticipantIds.length > 0 && expenseTotal > 0) {
      const shareAmount = Math.round((expenseTotal / selectedParticipantIds.length) * 100) / 100;
      const participants = selectedParticipantIds.map((memberId) => ({
        user_id: memberId,
        share_amount: shareAmount
      }));
      
      dispatch(addNewExpense(id, {
        title: expenseTitle,
        description: JSON.stringify({ items: validItems }),
        total_amount: expenseTotal,
        quantity: validItems.reduce((sum, item) => sum + item.quantity, 0)
      }, participants, null) as any);
      
      resetExpenseForm();
    }
  };

  const getExpenseItems = (expense: any) => {
    try {
      return JSON.parse(expense.description || '{}').items || [];
    } catch {
      return [];
    }
  };

  const getParticipantCount = (expense: any) => {
    return expense.expense_participants?.length || expense.participants?.length || 0;
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      try {
        const res = await post(POST_INVITE(id), { email: inviteEmail });
        setInviteMessage(res.message || "Invitation sent!");
        setInviteEmail('');
        setTimeout(() => {
          setInviteMessage('');
          setShowInviteModal(false);
        }, 2000);
      } catch (err: any) {
        setInviteMessage("Failed to send invite: " + (err.response?.data?.message || err.response?.data?.error || "Unknown error"));
      }
    }
  };

  const resetSettlementForm = () => {
    setShowSettlementModal(false);
    setPayerId('');
    setReceiverId('');
    setSettlementAmount('');
    setSettlementMessage('');
  };

  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (payerId === receiverId) {
      setSettlementMessage('Payer and receiver must be different members.');
      return;
    }

    try {
      await post(POST_SETTLEMENT(id), {
        settlement: {
          payer_id: payerId,
          receiver_id: receiverId,
          amount: parseFloat(settlementAmount)
        }
      });
      setSettlementMessage('Payment recorded.');
      dispatch(fetchGroupDetail(id) as any);
      dispatch(fetchExpenses(id) as any);
      setTimeout(resetSettlementForm, 900);
    } catch (err: any) {
      const data = err.response?.data;
      const message = data?.message || (data && typeof data === 'object' ? Object.values(data).flat().join(', ') : '');
      setSettlementMessage(`Failed to record payment: ${message || 'Unknown error'}`);
    }
  };

  if (groupLoading) return <Container className="mt-5">Loading group details...</Container>;

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>{groupDetail.name}</h2>
            <div className="d-flex gap-2">
              <Button variant="outline-success" onClick={() => setShowSettlementModal(true)}>
                <CreditCard size={20} className="me-2" />
                Settle Debt
              </Button>
              <Button variant="primary" onClick={handleShowExpenseModal}>
                <PlusCircle size={20} className="me-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="py-3">
              <h5 className="mb-0 text-primary">
                <Receipt size={20} className="me-2" />
                Recent Expenses
              </h5>
            </Card.Header>
            <Card.Body>
              {expenseLoading ? (
                <p>Loading expenses...</p>
              ) : expenses.length > 0 ? (
                <ListGroup variant="flush">
                  {expenses.map((expense: any) => (
                    <ListGroup.Item key={expense.id} className="d-flex justify-content-between align-items-center py-3">
                      <div>
                        <h6 className="mb-0">{expense.title}</h6>
                        <small className="text-muted">
                          {new Date(expense.created_at).toLocaleDateString()}
                          {getExpenseItems(expense).length > 0 && ` · ${getExpenseItems(expense).length} item${getExpenseItems(expense).length === 1 ? '' : 's'}`}
                          {getParticipantCount(expense) > 0 && ` · split between ${getParticipantCount(expense)}`}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">${expense.total_amount}</div>
                        <Badge bg="light" text="dark" pill>
                          {expense.category || 'General'}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4 text-muted">
                  <p>No expenses recorded yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <DashboardAnalytics expenses={expenses} />
          
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="py-3">
              <h5 className="mb-0 text-success">
                <Users size={20} className="me-2" />
                Members
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {groupDetail.members?.map((member: any) => (
                  <ListGroup.Item key={member.id} className="border-0 px-0 py-2 d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <Users size={16} />
                    </div>
                    <div>
                      <div className="fw-bold">{member.full_name || member.email}</div>
                      <small className="text-muted">Member</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button variant="outline-success" size="sm" className="w-100 mt-3" onClick={() => setShowInviteModal(true)}>
                Invite Someone
              </Button>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 bg-primary text-white">
            <Card.Body className="text-center py-4">
              <CreditCard size={40} className="mb-3" />
              <h4>Total Group Spend</h4>
              <h2 className="fw-bold">
                ${expenses.reduce((sum: number, e: any) => sum + parseFloat(e.total_amount), 0).toFixed(2)}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Expense Modal */}
      <Modal show={showExpenseModal} onHide={resetExpenseForm} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Expense</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddExpense}>
          <Modal.Body>
            {expenseError && <Alert variant="danger">{expenseError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>What is this for?</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Dinner, Rent, Groceries"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                required
              />
            </Form.Group>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Products</Form.Label>
                <Button variant="outline-primary" size="sm" type="button" onClick={handleAddExpenseItem}>
                  <PlusCircle size={16} className="me-1" />
                  Add product
                </Button>
              </div>
              <Table responsive className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ width: '110px' }}>Qty</th>
                    <th style={{ width: '150px' }}>Price ($)</th>
                    <th style={{ width: '120px' }}>Total</th>
                    <th style={{ width: '52px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {expenseItems.map((item, index) => {
                    const rowTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.amount) || 0);
                    return (
                      <tr key={index}>
                        <td>
                          <Form.Control
                            type="text"
                            placeholder="e.g. Pizza"
                            value={item.name}
                            onChange={(e) => handleExpenseItemChange(index, 'name', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleExpenseItemChange(index, 'quantity', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.amount}
                            onChange={(e) => handleExpenseItemChange(index, 'amount', e.target.value)}
                            required
                          />
                        </td>
                        <td className="fw-semibold">${rowTotal.toFixed(2)}</td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            aria-label="Remove product"
                            disabled={expenseItems.length === 1}
                            onClick={() => handleRemoveExpenseItem(index)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Split between</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="All members"
                  checked={members.length > 0 && selectedParticipantIds.length === members.length}
                  onChange={(e) => handleSelectAllParticipants(e.target.checked)}
                />
              </div>
              <div className="border rounded p-3">
                {members.map((member: any) => (
                  <Form.Check
                    key={member.id}
                    type="checkbox"
                    className="mb-2"
                    label={member.full_name || member.email}
                    checked={selectedParticipantIds.includes(String(member.id))}
                    onChange={() => handleParticipantToggle(String(member.id))}
                  />
                ))}
              </div>
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center border-top pt-3">
              <div className="text-muted small">
                {selectedParticipantIds.length > 0
                  ? `Each selected member owes $${(expenseTotal / selectedParticipantIds.length).toFixed(2)}`
                  : 'Select at least one member for this expense.'}
              </div>
              <div className="fs-5 fw-bold">Total: ${expenseTotal.toFixed(2)}</div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetExpenseForm}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={expenseTotal <= 0 || selectedParticipantIds.length === 0}>
              Save Expense
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Settle Debt Modal */}
      <Modal show={showSettlementModal} onHide={resetSettlementForm} centered>
        <Modal.Header closeButton>
          <Modal.Title>Settle a Debt</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSettleDebt}>
          <Modal.Body>
            {settlementMessage && (
              <Alert variant={settlementMessage.startsWith('Failed') || settlementMessage.includes('must be') ? 'danger' : 'success'}>
                {settlementMessage}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Payer</Form.Label>
              <Form.Select value={payerId} onChange={(e) => setPayerId(e.target.value)} required>
                <option value="">Select member</option>
                {groupDetail.members?.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Receiver</Form.Label>
              <Form.Select value={receiverId} onChange={(e) => setReceiverId(e.target.value)} required>
                <option value="">Select member</option>
                {groupDetail.members?.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetSettlementForm}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={!payerId || !receiverId || payerId === receiverId || parseFloat(settlementAmount) <= 0}>
              Record Payment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Invite a Member</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInvite}>
          <Modal.Body>
            {inviteMessage && <Alert variant={inviteMessage.includes('Failed') ? 'danger' : 'success'}>{inviteMessage}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter member's email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Send Invite
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default GroupDetail;
