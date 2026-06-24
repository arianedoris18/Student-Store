import "./CheckoutSuccess.css"

const CheckoutSuccess = ({ order, setOrder }) => {
  const handleOnClose = () => {
    setOrder(null)
  }

  const renderReceipt = () => (
    <>
      <p className="header">Order #{order.order_id}</p>
      <ul className="purchase">
        <li>Customer ID: {order.customer_id}</li>
        <li>Status: {order.status}</li>
        <li>Total: ${Number(order.total_price || 0).toFixed(2)}</li>
        <li>Items: {order.order_items?.length || 0}</li>
      </ul>
    </>
  )

  return (
    <div className="CheckoutSuccess">
      <h3>
        Checkout Info{" "}
        <span className={`icon button`}>
          <i className="material-icons md-48">fact_check</i>
        </span>
      </h3>
      {order ? (
        <div className="card">
          <header className="card-head">
            <h4 className="card-title">Receipt</h4>
          </header>
          <section className="card-body">{renderReceipt()}</section>
          <footer className="card-foot">
            <button className="button is-success" onClick={handleOnClose}>
              Shop More
            </button>
            <button className="button" onClick={handleOnClose}>
              Exit
            </button>
          </footer>
        </div>
      ) : (
        <div className="content">
          <p>
            A confirmation email will be sent to you so that you can confirm this order. Once you have confirmed the
            order, it will be delivered to your dorm room.
          </p>
        </div>
      )}
    </div>
  )
}

export default CheckoutSuccess
