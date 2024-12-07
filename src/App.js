import React, { useState, useEffect } from "react";
import { Input, Select, List, Card, Row, Col, Pagination, Spin, AutoComplete } from "antd";
import { useSpring, animated } from "@react-spring/web";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import "./SearchPage.css";

const { Option } = Select;

const App = () => {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://dummyjson.com/posts")
      .then((response) => {
        setData(response.data.posts);
        setFilteredData(response.data.posts);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (value) => {
    const filtered = data.filter(
      (item) =>
        item.title.toLowerCase().includes(value.toLowerCase()) &&
        (tag ? item.tags.includes(tag) : true)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleTagChange = (value) => {
    setTag(value);
    const filtered = data.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) &&
        (value ? item.tags.includes(value) : true)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSuggestionSelect = (value) => {
    setQuery(value);
    handleSearch(value);
  };

  const handleInputChange = (value) => {
    setQuery(value);
    if (value) {
      const matchedSuggestions = data
        .filter((item) => item.title.toLowerCase().includes(value.toLowerCase()))
        .map((item) => item.title);
      setSuggestions(matchedSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const paginatedResults = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="search-page">
      <div className="hero-banner">
        <h1 className="shiny-text">Discover Blogs</h1>
        <Row gutter={[16, 16]} justify="center" className="search-bar-container">
          <Col xs={24} sm={16} md={10}>
            <AutoComplete
              value={query}
              onChange={handleInputChange}
              onSelect={handleSuggestionSelect}
              options={suggestions.map((s) => ({ value: s }))}
              style={{ width: "100%" }}
              placeholder="Search for anything..."
            >
              <Input.Search
                onSearch={handleSearch}
                size="large"
                enterButton
              />
            </AutoComplete>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Filter by Tag"
              onChange={handleTagChange}
              style={{ width: "100%" }}
              allowClear
              size="large"
            >
              {[...new Set(data.flatMap((item) => item.tags))].map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>
      <Row gutter={[16, 16]} justify="center" className="results">
        <Col xs={24} sm={22} md={16}>
          {loading ? (
            <div className="spinner-container">
              <Spin size="large" tip="Loading blogs..." />
            </div>
          ) : (
            <>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 1,
                  md: 2,
                }}
                dataSource={paginatedResults}
                renderItem={(item) => (
                  <ScrollCard key={item.id} title={item.title} body={item.body} tags={item.tags} />
                )}
              />
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={handlePageChange}
                style={{ textAlign: "center", marginTop: "16px" }}
                className="pagination"
              />
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};


const ScrollCard = ({ title, body, tags }) => {
  const [ref, inView] = useInView({ triggerOnce: true });
  const animation = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0px)" : "translateY(50px)",
    config: { duration: 700 },
  });

  return (
    <animated.div style={animation} ref={ref}>
      <Card
        title={title}
        hoverable
        className="result-card"
      >
        <p>{body}</p>
        <p>
          <strong>Tags:</strong> {tags.join(", ")}
        </p>
      </Card>
    </animated.div>
  );
};

export default App;
