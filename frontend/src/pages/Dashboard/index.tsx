import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Modal, Form, Alert, Badge, ListGroup, ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchGroups, addNewGroup } from '../../slices/groups/thunk';
import { RootState } from '../../slices';
import { post } from '../../helpers/api_helper';
import { POST_PLATFORM_INVITE } from '../../helpers/url_helper';
import { BarChart2, CreditCard, PieChart, Receipt, TrendingDown, TrendingUp, Users } from 'lucide-react';

const money = (amount: number) => `$${amount.toFixed(2)}`;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groups, loading } = useSelector((state: RootState) => state.Group);
  const { user } = useSelector((state: RootState) => state.Login);

  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [expenseFilter, setExpenseFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchGroups() as any);
  }, [dispatch]);

  const authUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('authUser') || '{}');
    } catch {
      return {};
    }
  })();
  const currentUserId = authUser?.id || user?.id;

  const allExpenses = groups.flatMap((group: any) => (
    (group.expenses || []).map((expense: any) => ({ ...expense, group_name: group.name, group_id: group.id }))
  ));
  const allSettlements = groups.flatMap((group: any) => (
    (group.settlements || []).map((settlement: any) => ({ ...settlement, group_name: group.name, group_id: group.id }))
  ));
  const expensesByGroup = groupFilter === 'all'
    ? allExpenses
    : allExpenses.filter((expense: any) => String(expense.group_id) === groupFilter);
  const settlementsByGroup = groupFilter === 'all'
    ? allSettlements
    : allSettlements.filter((settlement: any) => String(settlement.group_id) === groupFilter);

  const userShare = (expense: any) => {
    const participant = expense.expense_participants?.find((p: any) => String(p.user_id) === String(currentUserId));
    return parseFloat(participant?.share_amount || 0);
  };
  const otherShares = (expense: any) => (
    (expense.expense_participants || [])
      .filter((p: any) => String(p.user_id) !== String(currentUserId))
      .reduce((sum: number, p: any) => sum + parseFloat(p.share_amount || 0), 0)
  );
  const isPaidByMe = (expense: any) => String(expense.paid_by_id) === String(currentUserId);
  const isParticipant = (expense: any) => userShare(expense) > 0;

  const visibleExpenses = expensesByGroup.filter((expense: any) => {
    if (expenseFilter === 'owe') return isParticipant(expense) && !isPaidByMe(expense);
    if (expenseFilter === 'owed') return isPaidByMe(expense) && otherShares(expense) > 0;
    if (expenseFilter === 'paid') return isPaidByMe(expense);
    if (expenseFilter === 'involving') return isParticipant(expense) || isPaidByMe(expense);
    return true;
  });

  const totalSpend = expensesByGroup.reduce((sum: number, expense: any) => sum + parseFloat(expense.total_amount || 0), 0);
  const expenseYouOwe = expensesByGroup
    .filter((expense: any) => isParticipant(expense) && !isPaidByMe(expense))
    .reduce((sum: number, expense: any) => sum + userShare(expense), 0);
  const expenseOwedToYou = expensesByGroup
    .filter((expense: any) => isPaidByMe(expense))
    .reduce((sum: number, expense: any) => sum + otherShares(expense), 0);
  const paidSettlements = settlementsByGroup
    .filter((settlement: any) => String(settlement.payer_id) === String(currentUserId))
    .reduce((sum: number, settlement: any) => sum + parseFloat(settlement.amount || 0), 0);
  const receivedSettlements = settlementsByGroup
    .filter((settlement: any) => String(settlement.receiver_id) === String(currentUserId))
    .reduce((sum: number, settlement: any) => sum + parseFloat(settlement.amount || 0), 0);
  const netBalance = expenseOwedToYou - expenseYouOwe + paidSettlements - receivedSettlements;
  const youOwe = Math.max(-netBalance, 0);
  const owedToYou = Math.max(netBalance, 0);
  const yourShare = expensesByGroup.reduce((sum: number, expense: any) => sum + userShare(expense), 0);

  const groupTotals = groups.map((group: any) => ({
    id: group.id,
    name: group.name,
    total: (group.expenses || []).reduce((sum: number, expense: any) => sum + parseFloat(expense.total_amount || 0), 0)
  }));
  const maxGroupTotal = Math.max(...groupTotals.map((group: any) => group.total), 1);
  const balanceParts = [
    { label: 'You owe', value: youOwe, color: '#dc3545' },
    { label: 'Owed to you', value: owedToYou, color: '#198754' },
    { label: 'Your share', value: yourShare, color: '#0d6efd' }
  ];
  const balanceTotal = balanceParts.reduce((sum, part) => sum + part.value, 0);
  let pieCursor = 0;
  const pieGradient = balanceTotal > 0
    ? `conic-gradient(${balanceParts.map((part) => {
        const start = pieCursor;
        const end = pieCursor + (part.value / balanceTotal) * 100;
        pieCursor = end;
        return `${part.color} ${start}% ${end}%`;
      }).join(', ')})`
    : '#e9ecef';

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addNewGroup({ name: groupName }, navigate) as any);
    setShowModal(false);
    setGroupName('');
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await post(POST_PLATFORM_INVITE, { email: inviteEmail });
      setInviteMessage(res.message || 'Invitation sent!');
      setInviteEmail('');
      setTimeout(() => {
        setInviteMessage('');
        setShowInviteModal(false);
      }, 2000);
    } catch (err: any) {
      setInviteMessage('Failed to send invite: ' + (err.response?.data?.message || err.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Dashboard</h1>
          <div className="text-muted">Track what you owe, what others owe you, and group spending.</div>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowInviteModal(true)}>Invite User</Button>
          <Button variant="primary" onClick={() => setShowModal(true)}>Create New Group</Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">You owe</div>
                  <h3 className="text-danger mb-0">{money(youOwe)}</h3>
                </div>
                <TrendingDown className="text-danger" size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Owed to you</div>
                  <h3 className="text-success mb-0">{money(owedToYou)}</h3>
                </div>
                <TrendingUp className="text-success" size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Net balance</div>
                  <h3 className={netBalance >= 0 ? 'text-success mb-0' : 'text-danger mb-0'}>{money(Math.abs(netBalance))}</h3>
                </div>
                <CreditCard className={netBalance >= 0 ? 'text-success' : 'text-danger'} size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small">Group spend</div>
                  <h3 className="text-primary mb-0">{money(totalSpend)}</h3>
                </div>
                <Receipt className="text-primary" size={30} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Group</Form.Label>
              <Form.Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
                <option value="all">All groups</option>
                {groups.map((group: any) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label>Expenses</Form.Label>
              <Form.Select value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)}>
                <option value="all">All expenses</option>
                <option value="owe">You owe</option>
                <option value="owed">Owed to you</option>
                <option value="paid">Paid by you</option>
                <option value="involving">Involving you</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <div className="text-muted small">Showing {visibleExpenses.length} of {expensesByGroup.length} expenses</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-4 mb-4">
        <Col lg={5}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="py-3">
              <h5 className="mb-0">
                <PieChart size={20} className="me-2" />
                Balance Mix
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center gap-4">
                <div
                  aria-label="Balance pie chart"
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: pieGradient,
                    flex: '0 0 auto'
                  }}
                />
                <div className="w-100">
                  {balanceParts.map((part) => (
                    <div key={part.label} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2" style={{ width: 12, height: 12, borderRadius: 3, background: part.color, display: 'inline-block' }} />
                        <span>{part.label}</span>
                      </div>
                      <strong>{money(part.value)}</strong>
                    </div>
                  ))}
                  {balanceTotal === 0 && <div className="text-muted small">No balances to chart yet.</div>}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="py-3">
              <h5 className="mb-0">
                <BarChart2 size={20} className="me-2" />
                Spending by Group
              </h5>
            </Card.Header>
            <Card.Body>
              {groupTotals.length > 0 ? groupTotals.map((group: any) => (
                <div key={group.id} className="mb-3">
                  <div className="d-flex justify-content-between mb-1 small">
                    <span>{group.name}</span>
                    <strong>{money(group.total)}</strong>
                  </div>
                  <ProgressBar now={(group.total / maxGroupTotal) * 100} style={{ height: 10 }} />
                </div>
              )) : (
                <div className="text-muted text-center py-4">No group spending yet.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="py-3">
              <h5 className="mb-0">Filtered Expenses</h5>
            </Card.Header>
            <Card.Body>
              {visibleExpenses.length > 0 ? (
                <ListGroup variant="flush">
                  {visibleExpenses.map((expense: any) => {
                    const share = userShare(expense);
                    const owed = isPaidByMe(expense) ? otherShares(expense) : 0;
                    return (
                      <ListGroup.Item key={expense.id} className="px-0 py-3 d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{expense.title}</div>
                          <div className="text-muted small">
                            {expense.group_name} · {new Date(expense.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">{money(parseFloat(expense.total_amount || 0))}</div>
                          {isPaidByMe(expense) ? (
                            <Badge bg="success" text="light">owed {money(owed)}</Badge>
                          ) : share > 0 ? (
                            <Badge bg="danger" text="light">you owe {money(share)}</Badge>
                          ) : (
                            <Badge bg="light" text="dark">not split with you</Badge>
                          )}
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <div className="text-center py-4 text-muted">No expenses match this filter.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="py-3">
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                My Groups
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">Loading groups...</div>
              ) : groups.length > 0 ? (
                <ListGroup variant="flush">
                  {groups.map((group: any) => (
                    <ListGroup.Item key={group.id} className="px-0 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{group.name}</div>
                        <div className="text-muted small">{(group.expenses || []).length} expenses</div>
                      </div>
                      <Button as={Link} to={`/groups/${group.id}`} variant="outline-primary" size="sm">
                        View
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center text-muted py-4">
                  <h5>No groups yet</h5>
                  <p className="mb-0">Start by creating a new group to split expenses.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateGroup}>
          <Modal.Body>
            <Form.Group controlId="groupName">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Apartment, Trip to Goa"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Group
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Invite User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInviteUser}>
          <Modal.Body>
            {inviteMessage && <Alert variant={inviteMessage.includes('Failed') ? 'danger' : 'success'}>{inviteMessage}</Alert>}
            <Form.Group controlId="inviteEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
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
            <Button variant="primary" type="submit">
              Send Invite
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
