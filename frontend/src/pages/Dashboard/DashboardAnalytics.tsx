import React from 'react';
import { Card, ProgressBar, Row, Col } from 'react-bootstrap';
import { PieChart, BarChart2, TrendingUp } from 'lucide-react';

const DashboardAnalytics = ({ expenses }: { expenses: any[] }) => {
  const totalSpend = expenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0);
  
  // Categorize expenses
  const categories = expenses.reduce((acc: any, e) => {
    const cat = e.category || 'General';
    acc[cat] = (acc[cat] || 0) + parseFloat(e.total_amount);
    return acc;
  }, {});

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0 text-dark">
          <BarChart2 size={20} className="me-2" />
          Spending Insights
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="text-center mb-4">
          <Col>
            <div className="text-muted small mb-1">Monthly Avg</div>
            <h4 className="fw-bold mb-0 text-primary">${(totalSpend / 3).toFixed(2)}</h4>
          </Col>
          <Col className="border-start border-end">
            <div className="text-muted small mb-1">Largest Expense</div>
            <h4 className="fw-bold mb-0 text-danger">
              ${Math.max(...expenses.map(e => parseFloat(e.total_amount) || 0), 0).toFixed(2)}
            </h4>
          </Col>
          <Col>
            <div className="text-muted small mb-1">Total Savings</div>
            <h4 className="fw-bold mb-0 text-success">$0.00</h4>
          </Col>
        </Row>

        <h6 className="mb-3">Spending by Category</h6>
        {Object.entries(categories).map(([cat, amount]: [string, any]) => (
          <div key={cat} className="mb-3">
            <div className="d-flex justify-content-between mb-1 small">
              <span>{cat}</span>
              <span className="fw-bold">${amount.toFixed(2)}</span>
            </div>
            <ProgressBar 
              now={(amount / totalSpend) * 100} 
              variant={cat === 'Rent' ? 'danger' : cat === 'Food' ? 'success' : 'primary'} 
              style={{ height: '8px' }} 
            />
          </div>
        ))}
        
        {expenses.length === 0 && <p className="text-center text-muted py-3">No data to analyze yet.</p>}
      </Card.Body>
    </Card>
  );
};

export default DashboardAnalytics;
