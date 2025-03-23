from manim import *
import numpy as np

config.media_dir = "./out"

class PythagoreanTheorem(Scene):
    def construct(self):
        ##############################
        # Step 1: Setup the Triangle #
        ##############################
        # Define vertices: A, B, and C.
        A = np.array([2, 1, 0])
        B = np.array([-2, 1, 0])
        C = np.array([-2, -2, 0])
        
        # Create the triangle with vertices A, B, C.
        triangle = Polygon(A, B, C, color=WHITE)
        
        # Label the vertices.
        label_A = Tex("A").next_to(A, RIGHT)
        label_B = Tex("B").next_to(B, LEFT)
        label_C = Tex("C").next_to(C, DOWN)
        
        # Label the sides.
        # Side a is opposite A (side BC), side b is opposite B (side AC), side c is opposite C (side AB).
        midpoint_BC = (B + C) / 2
        midpoint_AC = (A + C) / 2
        midpoint_AB = (A + B) / 2
        
        label_a = MathTex(r"\mathit{a}").next_to(midpoint_BC, LEFT)
        label_b = MathTex(r"\mathit{b}").next_to(midpoint_AC, DOWN)
        label_c = MathTex(r"\mathit{c}").next_to(midpoint_AB, UP)
        
        self.play(
            Create(triangle),
            Write(label_A), Write(label_B), Write(label_C),
            Write(label_a), Write(label_b), Write(label_c)
        )
        self.wait(1)
        
        ##############################################
        # Step 2: Constructing Squares on Each Side  #
        ##############################################
        # Square on side 'a' (side BC).
        # The vector from B to C is vertical; to construct the square externally (away from vertex A),
        # we add an offset to the left.
        offset_a = np.array([-3, 0, 0])  # Length equals |BC| = 3
        square_a = Polygon(B, C, C + offset_a, B + offset_a, color=BLUE)
        
        # Square on side 'b' (side AC).
        # For segment AC, choose an offset that points away from the remaining vertex (B).
        offset_b = np.array([3, -4, 0])  # (Chosen so that the square is external)
        square_b = Polygon(A, C, C + offset_b, A + offset_b, color=GREEN)
        
        # Square on side 'c' (side AB, the hypotenuse).
        # For side AB, extend upward (away from C).
        offset_c = np.array([0, 4, 0])  # (|AB| = 4)
        square_c = Polygon(A, B, B + offset_c, A + offset_c, color=RED)
        
        self.play(Create(square_a), Create(square_b), Create(square_c))
        self.wait(1)
        
        ###################################################
        # Step 3: Animate the Area Transformation Process  #
        ###################################################
        # We simulate the rearrangement by transforming copies of squares a and b into
        # two rectangular pieces that will exactly fill square c.
        # (For clarity, we use target rectangles that together have the same position as square c.)
        left_rect = Rectangle(width=2, height=4, color=BLUE).move_to(np.array([-1, 3, 0]))
        right_rect = Rectangle(width=2, height=4, color=GREEN).move_to(np.array([1, 3, 0]))
        
        # Make copies of the original squares a and b.
        square_a_copy = square_a.copy()
        square_b_copy = square_b.copy()
        
        # Apply intermediate shearing to simulate a geometric transformation.
        shear_matrix_a = [[1, 0.5], [0, 1]]
        shear_matrix_b = [[1, -0.5], [0, 1]]
        self.play(
            ApplyMatrix(shear_matrix_a, square_a_copy),
            ApplyMatrix(shear_matrix_b, square_b_copy)
        )
        self.wait(0.5)
        
        # Transform the sheared copies into the target rectangles.
        self.play(
            Transform(square_a_copy, left_rect),
            Transform(square_b_copy, right_rect)
        )
        self.wait(1)
        
        # Combine the two pieces to simulate filling the square on the hypotenuse.
        rearranged_group = VGroup(square_a_copy, square_b_copy)
        self.play(FadeTransform(rearranged_group, square_c))
        self.wait(1)
        
        #########################################
        # Step 4: Display the Pythagorean Equation #
        #########################################
        # Create the equation as three separate parts for easier highlighting.
        equation = MathTex(r"\mathit{a}^2", "+", r"\mathit{b}^2", "=", r"\mathit{c}^2")
        equation.to_edge(UP)
        self.play(Write(equation))
        self.wait(1)
        
        #####################################################
        # Step 5: Final Summary with Visual Emphasis         #
        #####################################################
        # Highlight each term in the equation while temporarily changing the color
        # of the corresponding square.
        # Highlight a² (corresponding to square a, originally BLUE).
        self.play(Indicate(equation[0]), square_a.animate.set_color(YELLOW))
        self.wait(0.5)
        self.play(square_a.animate.set_color(BLUE))
        
        # Highlight b² (corresponding to square b, originally GREEN).
        self.play(Indicate(equation[2]), square_b.animate.set_color(YELLOW))
        self.wait(0.5)
        self.play(square_b.animate.set_color(GREEN))
        
        # Highlight c² (corresponding to square c, originally RED).
        self.play(Indicate(equation[4]), square_c.animate.set_color(YELLOW))
        self.wait(0.5)
        self.play(square_c.animate.set_color(RED))
        self.wait(1)
        
        # Clear all objects to conclude the scene.
        all_objects = VGroup(
            triangle, label_A, label_B, label_C,
            label_a, label_b, label_c,
            square_a, square_b, square_c, equation
        )
        self.play(FadeOut(all_objects))
        self.wait(1)
