```c
#include <stdio.h>
#include <stdbool.h>
#include <math.h>

// Approach 1: Basic primality test

bool isPrime_basic(int n) {
    if (n <= 1) return false;
    for (int i = 2; i < n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

// Approach 2: Optimized primality test (check only up to sqrt(n))

bool isPrime_optimized(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (int i = 5; i * i <= n; i = i + 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

// Approach 3: Primality test using precomputed primes (for a range)

#define MAX_SIZE 1000 // Example max size, adjust as needed

bool isPrime_precomputed(int n, bool primes[]) {
    if (n < 2 || n >= MAX_SIZE) return false; // Out of range
    return primes[n];
}

void precomputePrimes(bool primes[]) {
    for (int i = 0; i < MAX_SIZE; i++) {
        primes[i] = true;
    }
    primes[0] = primes[1] = false;

    for (int p = 2; p * p < MAX_SIZE; p++) {
        if (primes[p] == true) {
            for (int i = p * p; i < MAX_SIZE; i += p)
                primes[i] = false;
        }
    }
}

// Approach 4: Miller-Rabin primality test (probabilistic)

long long power(long long base, long long exp, long long mod) {
    long long res = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 == 1) res = (res * base) % mod;
        base = (base * base) % mod;
        exp = exp >> 1;
    }
    return res;
}

bool millerRabinTest(long long n, long long a) {
    long long d = n - 1;
    while (d % 2 == 0) d /= 2;

    long long x = power(a, d, n);
    if (x == 1 || x == n - 1) return true;

    while (d != n - 1) {
        x = (x * x) % n;
        d *= 2;
        if (x == 1) return false;
        if (x == n - 1) return true;
    }

    return false;
}

bool isPrime_millerRabin(long long n, int k) {
    if (n <= 1) return false;
    if (n <= 3) return true;

    for (int i = 0; i < k; i++) {
        long long a = 2 + rand() % (n - 4); // Choose a random integer in the range [2, n-2]
        if (!millerRabinTest(n, a)) return false;
    }
    return true; // Likely prime
}


int main() {
    int num = 29;

    // Approach 1: Basic
    if (isPrime_basic(num)) {
        printf("%d is a prime number (Basic).\n", num);
    } else {
        printf("%d is not a prime number (Basic).\n", num);
    }

    // Approach 2: Optimized
    if (isPrime_optimized(num)) {
        printf("%d is a prime number (Optimized).\n", num);
    } else {
        printf("%d is not a prime number (Optimized).\n", num);
    }

    // Approach 3: Precomputed
    bool primes[MAX_SIZE];
    precomputePrimes(primes);

    if (num < MAX_SIZE && isPrime_precomputed(num, primes)) {
        printf("%d is a prime number (Precomputed).\n", num);
    } else {
        printf("%d is not a prime number or out of precomputed range.\n", num);
    }

    // Approach 4: Miller-Rabin (Probabilistic)
    int k = 5; // Number of iterations (higher k increases accuracy)
    if (isPrime_millerRabin(num, k)) {
        printf("%d is likely a prime number (Miller-Rabin).\n", num);
    } else {
        printf("%d is not a prime number (Miller-Rabin).\n", num);
    }
    return 0;
}
```
