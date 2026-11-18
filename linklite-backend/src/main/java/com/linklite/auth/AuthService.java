
package com.linklite.auth;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.linklite.auth.dto.AuthResponse;
import com.linklite.auth.dto.RegisterRequest;
import com.linklite.user.User;
import com.linklite.user.UserRepository;

import com.linklite.auth.dto.LoginRequest;
import com.linklite.auth.dto.LoginResponse;
import com.linklite.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String normalizedEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        String encodedPassword =
                passwordEncoder.encode(request.password());

        User user = new User(
                request.fullName().trim(),
                normalizedEmail,
                encodedPassword
        );

        user.setRole("USER");

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                "Registration successful",
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }
    

public LoginResponse login(LoginRequest request) {

    String normalizedEmail = request.email()
            .trim()
            .toLowerCase(Locale.ROOT);

    User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            ));

    if (!passwordEncoder.matches(
            request.password(), user.getPassword())) {

        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
        );
    }

    String token = jwtService.generateToken(user.getEmail());

    return new LoginResponse(
            "Login successful",
            token,
            "Bearer",
            jwtService.getExpirationMs(),
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole()
    );
}

}
