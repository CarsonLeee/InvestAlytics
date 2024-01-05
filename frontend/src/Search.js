import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Search.css";
import Stock from "./Stock"; // Import the Stock component
import FavoriteStock from "./FavoriteStock";

const Search = ({ navigateTo }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockOptions, setStockOptions] = useState([]);
  const [tickerData, setTickerData] = useState([]); // State for ticker data
  const [selectedStock, setSelectedStock] = useState(null);
  const [showModal, setShowModal] = useState(false); // New state variable for modal display
  const [showStock, setShowStock] = useState(false);
  const [isRendered, setIsRendered] = useState(false); // New state for delayed rendering
  const [refetchFavorites, setRefetchFavorites] = useState(false);

  const handleFavoriteAdded = () => {
    setRefetchFavorites((prev) => !prev); // Toggle the state to trigger re-fetching favorites
  };

  const handleFavoriteStockClick = (symbol) => {
    setSelectedStock(symbol);
    setShowStock(true); // This will open the modal with the selected stock details
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigateTo("login"); // Navigate to login screen
  };
  
  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const apiKey = "pk_fa779df6b79c4e499e1d7114377e9684";
        const url = `https://cloud.iexapis.com/stable/stock/market/list/mostactive?token=${apiKey}&listLimit=1000`; // Fetch most active 100 stocks
        const response = await axios.get(url);
        const formattedData = response.data.map((stock) => ({
          symbol: stock.symbol,
          price: stock.latestPrice,
          trend: stock.changePercent >= 0 ? "up" : "down",
        }));
        setTickerData(formattedData);
      } catch (error) {
        console.error("Error fetching ticker data: ", error);
      }
    };
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 60000);
    return () => clearInterval(interval);
  }, []);

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const response = await axios.get(
          `http://localhost:3001/user/${userId}/favorites`
        );
        console.log("Favorites response:", response.data); // Log the received data
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    if (localStorage.getItem("userId")) {
      fetchFavorites();
    }
  }, [refetchFavorites]); // Add refetchFavorites as a dependency

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRendered(true);
    }, 100); // Small delay to avoid initial glitch
    return () => clearTimeout(timer);
  }, []);

  const handleBackFromStock = () => {
    setRefetchFavorites((prev) => !prev); // Toggle the refetchFavorites state
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        const apiKey = "pk_fa779df6b79c4e499e1d7114377e9684";
        const url = `https://cloud.iexapis.com/stable/search/${searchTerm}?token=${apiKey}`;
        axios
          .get(url)
          .then((response) => {
            setStockOptions(response.data);
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
            setStockOptions([]);
          });
      } else {
        setStockOptions([]);
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleStockClick = (symbol) => {
    setSelectedStock(symbol);
    setShowStock(true); // Show the stock container
  };

  // Function to close the stock view
  const closeStock = () => {
    setShowStock(false);
    setSelectedStock(null);
  };

  const closeModal = () => {
    setSelectedStock(null);
    setShowModal(false); // Set showModal to false when closing the modal
  };
  return (
    <>
      {isRendered && (
        <>
          <div className="ticker-wrap">
            <div className="ticker">
              {tickerData.map((item, index) => (
                <div className="ticker-item" key={index}>
                  {item.symbol}: {item.price}
                  {item.trend === "up"
                    ? " ↑"
                    : item.trend === "down"
                    ? " ↓"
                    : " -"}
                </div>
              ))}
            </div>
          </div>

          <div className="search-container animated">
            <h2 className="title">InvestAlytics</h2>
            <div className="instruction-section">
              <p>
                Type in the stock you are interested in to analyze it using
                technical analysis. 
              </p>
            </div>
            <div className="search-bar">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="search-form"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for a stock"
                  className="search-input"
                />
              </form>
            </div>
            {stockOptions.length > 0 && (
              <ul className="stock-list">
                {stockOptions.map((stock, index) => (
                  <li
                    key={index}
                    onClick={() => handleStockClick(stock.symbol)}
                    className="stock-item"
                  >
                    {stock.name} ({stock.symbol})
                  </li>
                ))}
              </ul>
            )}
            {selectedStock && (
              <div className="modal" onClick={closeModal}>
                <div
                  className={`modal-content ${
                    showModal ? "modal-content-open" : ""
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Stock
                    selectedStock={selectedStock}
                    onClose={handleBackFromStock}
                    onFavoriteAdded={handleFavoriteAdded}
                    favorites={favorites}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="favorites-grid">
            {favorites.map((stockSymbol, index) => (
              <FavoriteStock
                key={index}
                symbol={stockSymbol}
                onClick={handleFavoriteStockClick}
              />
            ))}
          </div>
          {/* Logout Button Wrapper */}
          <div className="logout-button-outer-wrapper">
            <div className="logout-button-inner-wrapper">
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {/* Your Name at the End of the Page */}
          <div className="end-of-page-name">Carson Lee</div>
        </>
      )}
    </>
  );
};

export default Search;
