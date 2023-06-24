import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import {ArrowDownward, ArrowUpward, ExpandLess, ExpandMore} from '@mui/icons-material'

const styles = {
    image: {
        width: "100px",
        height: "100px",
        objectFit: "cover",
        borderRadius: ".5rem"
    },
    ascdesc: {
        cursor: "pointer",
        verticalAlign: "middle"
    }
};


function App() {
    const [products, setProducts] = useState([]); // state for products data
    const [editPrice, setEditPrice] = useState({}); // state for edited price values
    const [categories, setCategories] = useState({}); // state for categories and their expanded status
    const [sortOrder, setSortOrder] = useState("asc"); // state for sort order of price

    const originalProducts = useRef({});

    useEffect(() => {
        // check if there is any data in the session storage on mount
        const storedProducts = sessionStorage.getItem("currentProducts");
        const storedOriginalProducts = sessionStorage.getItem("originalProducts");
        if (storedProducts && storedOriginalProducts) {
            // parse the stored data and use it to initialize the states
            const parsedProducts = JSON.parse(storedProducts);
            originalProducts.current = JSON.parse(sessionStorage.getItem("originalProducts"));

            setProducts(parsedProducts);
            let initialEditPrice = {};
            parsedProducts.forEach((product) => {
                initialEditPrice[product.id] = product.price;
            });
            setEditPrice(initialEditPrice);
            let initialCategories = {};
            parsedProducts.forEach((product) => {
                if (!initialCategories[product.category]) {
                    initialCategories[product.category] = false;
                }
            });
            setCategories(initialCategories);
        } else {
        axios
            .get("http://localhost:3000/api/v1/products/")
            .then((res) => {
                let productdata = res.data.products
                setProducts(productdata);
                originalProducts.current = productdata;
                sessionStorage.setItem("originalProducts", JSON.stringify(productdata));
                sessionStorage.setItem("currentProducts", JSON.stringify(productdata));
                let initialEditPrice = {};
                productdata.forEach((product) => {
                    if (!initialEditPrice[product.id]) {
                        initialEditPrice[product.id] = product.price;
                    }
                });
                setEditPrice(initialEditPrice);
                // initialize categories state with unique categories and false expanded status
                let initialCategories = {};
                productdata.forEach((product) => {
                    if (!initialCategories[product.category]) {
                        initialCategories[product.category] = false;
                    }
                });
                setCategories(initialCategories);
            })
            .catch((err) => {
                console.error(err);
            })}
    }, []);

    const handleExpand = (category) => {
        // toggle the expanded status of a category
        setCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const handleChange = (id, value) => {
        // update the editPrice state with the new value
        setEditPrice((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSave = () => {
        // save the edited price values to the products state
        setProducts((prev) =>
            prev.map((product) => ({
                ...product,
                price: editPrice[product.id],
            }))
        );
        // save the updated products data to the session storage as well
        sessionStorage.setItem(
            "currentProducts",
            JSON.stringify(
                products.map((product) => ({
                    ...product,
                    price: editPrice[product.id],
                }))
            )
        );
    };

    const handleReset = () => {
        // reset the products and editPrice states to the original values from the useRef variable
        setProducts(originalProducts.current);
        sessionStorage.setItem("currentProducts", JSON.stringify(originalProducts.current));
        let resetEditPrice = {};
        originalProducts.current.forEach((product) => {
            resetEditPrice[product.id] = product.price;
        });
        setEditPrice(resetEditPrice);
    };

    const handleSort = () => {
        // sort the products state by price in ascending or descending order
        let sortedProducts = [...products];
        if (sortOrder === "asc") {
            sortedProducts.sort((a, b) => a.price - b.price);
            setSortOrder("desc");
        } else {
            sortedProducts.sort((a, b) => b.price - a.price);
            setSortOrder("asc");
        }
        setProducts(sortedProducts);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Label</TableCell>
                        <TableCell onClick={handleSort} style={styles.priceCell}> Price
                            {/* conditionally render the icon based on the sortOrder state */}
                            {sortOrder === "asc" ? <ArrowUpward style={styles.ascdesc}/> :
                                <ArrowDownward style={styles.ascdesc}/>}</TableCell>
                        <TableCell>Description</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(categories).map((category) => (
                        <React.Fragment key={category}>
                            {/* render a category row with expand/collapse icon */}
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <IconButton onClick={() => handleExpand(category)}>
                                        {categories[category] ? (
                                            <ExpandLess/>
                                        ) : (
                                            <ExpandMore/>
                                        )}
                                    </IconButton>
                                    {category}
                                </TableCell>
                            </TableRow>
                            {/* render the products of the category if expanded */}
                            {categories[category] &&
                                products
                                    .filter((product) => product.category === category)
                                    .map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>
                                                <img src={product.image} style={styles.image} alt={product.name}/>
                                            </TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>{product.label}</TableCell>
                                            {/* render a text field for editing price */}
                                            <TableCell>
                                                <TextField
                                                    value={editPrice[product.id]}
                                                    onChange={(e) =>
                                                        handleChange(product.id, e.target.value)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{product.description}</TableCell>
                                        </TableRow>
                                    ))}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
            {/* render save and reset buttons */}
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={handleReset}>Reset</Button>
        </TableContainer>
    )
}


export default App
