if (!require("IRkernel")) {
  install.packages("IRkernel", repos="https://cran.rstudio.com/")
}
IRkernel::installspec(user = TRUE)
print("R kernel installed successfully!")
