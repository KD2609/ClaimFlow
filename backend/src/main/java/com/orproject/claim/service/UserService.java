package com.orproject.claim.service;

import com.orproject.claim.model.Role;
import com.orproject.claim.model.User;
import com.orproject.claim.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean validateCredentials(String username, String rawPassword, PasswordEncoder encoder) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }
        return encoder.matches(rawPassword, userOpt.get().getPassword());
    }

    @Transactional
    public User registerUser(String username, String rawPassword, String fullName, Role role, PasswordEncoder encoder) {
        if (userRepository.existsByUsername(username)) {
            return userRepository.findByUsername(username).get();
        }
        User user = new User(username, encoder.encode(rawPassword), fullName, role);
        return userRepository.save(user);
    }
}
