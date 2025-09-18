---

# YAML Basics

---

## Step-01: Comments & Key Value Pairs

* Space after colon (`:`) is mandatory to differentiate key and value.

```yml
# Defining simple key value pairs
name: Bala
role: Devops
city: Hyderabad
```

---

## Step-02: Dictionary / Map

* A set of properties grouped together.
* Items under a dictionary must have equal indentation.

```yml
person:
  name: Bala
  role: Devops
  city: Hyderabad
```

---

## Step-03: Array / Lists

* Dash (`-`) indicates an item in a list.

```yml
person:
  name: Bala
  hobbies:
    - cycling
    - cooking
```

* Alternate short syntax (inline list):

```yml
hobbies: [cycling, cooking]
```

---

## Step-04: List of Dictionaries

* A list where each item is itself a dictionary.

```yml
friends:
  - name: Arun
    age: 25
    role: Developer
  - name: Kavya
    age: 27
    role: Tester
```

---

## Step-05: Nested Dictionary

* A dictionary inside another dictionary.

```yml
employee:
  name: Bala
  address:
    city: Hyderabad
    pincode: 500081
    geo:
      lat: 17.385
      long: 78.4867
```

---

## Step-06: Dictionary with List of Dictionaries

* Combines nested dictionaries and lists.

```yml
school:
  name: Rainbow School
  location: Hyderabad
  classes:
    - name: Class 1
      students:
        - name: Raju
          age: 6
        - name: Anjali
          age: 5
    - name: Class 2
      students:
        - name: Sai
          age: 7
```

---

## Step-07: Sample Pod Template for Reference

* This is a real Kubernetes manifest and uses all key YAML structures.

```yml
apiVersion: v1                # Key-Value Pair
kind: Pod                     # Key-Value Pair
metadata:                     # Dictionary
  name: myapp-pod             # Key-Value Pair inside dictionary
  labels:                     # Nested Dictionary
    app: myapp                # Key-Value Pair
spec:                         # Dictionary
  containers:                 # List of Dictionaries
    - name: myapp             # First item in container list (Dictionary)
      image: stacksimplify/kubenginx:1.0.0
      ports:                  # List of Dictionaries
        - containerPort: 80
          protocol: "TCP"
        - containerPort: 81
          protocol: "TCP"
```

---

##  Summary of YAML Structures

| YAML Feature         | Keyword Example   | Explanation                            |
| -------------------- | ----------------- | -------------------------------------- |
| Key-Value Pair       | `name: Bala`      | Simple one-line assignment             |
| Dictionary (Map)     | `address: {}`     | Group of key-value pairs               |
| List                 | `- apple`         | Multiple values under a key            |
| Inline List          | `[apple, banana]` | Short-hand version of a list           |
| List of Dictionaries | `- name: Ram`     | Complex list where each item is a dict |
| Nested Dictionary    | `geo: {lat: x}`   | Dictionary inside a dictionary         |

---

Would you like this compiled as a downloadable **PDF or Markdown document** to share with your mentees or use in your Kubernetes class deck?
