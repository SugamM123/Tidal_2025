from manim import *
import numpy as np

class MyScene(Scene):
    def construct(self):
        # Set up constants for our axes and domains
        x_min, x_max = -5, 5
        y_min, y_max = -1, 20
        approx_domain = [-3, 3]  # domain for the Taylor approximation graphs

        # Define our functions
        def exp_func(x):
            return np.exp(x)

        def linear_approx(x):
            return 1 + x

        def quadratic_approx(x):
            return 1 + x + (x**2) / 2

        # Create and configure the axes
        axes = Axes(
            x_range=[x_min, x_max, 1],
            y_range=[y_min, y_max, 1],
            axis_config={"include_numbers": True},
            x_axis_config={"numbers_to_exclude": [0]},
            y_axis_config={"numbers_to_exclude": [0]}
        )
        axes.add_coordinate_labels()
        axes.x_axis.set_numbers_as_superscript()
        axes.y_axis.set_numbers_as_superscript()
        # Optionally, reposition the axes if needed to avoid overlaps
        axes.to_edge(DOWN)

        # ---------------------------
        # Phase 1: Draw Axes and the Exponential Graph
        # ---------------------------
        self.play(Create(axes), run_time=2)
        expGraph = axes.plot(
            exp_func,
            x_range=[x_min, x_max],
            color=BLUE,
            stroke_width=3
        ).set_z_index(1)
        self.play(Write(expGraph), run_time=3)

        # ---------------------------
        # Phase 2: Mark the Base Point and Draw the Constant Approximation (Degree-0)
        # ---------------------------
        base_point = axes.coords_to_point(0, exp_func(0))  # (0, 1)
        baseDot = Dot(base_point, color=RED).set_z_index(2)
        self.play(Create(baseDot), run_time=1.5)
        baseLine = DashedLine(
            start=axes.coords_to_point(x_min, exp_func(0)),
            end=axes.coords_to_point(x_max, exp_func(0)),
            color=YELLOW
        )
        self.play(Create(baseLine), run_time=1.5)

        # ---------------------------
        # Phase 3: Replace Constant Approximation with Linear (Degree-1) Taylor Approximation
        # ---------------------------
        p1Graph = axes.plot(
            linear_approx,
            x_range=approx_domain,
            color=GREEN,
            stroke_dasharray=[3, 3]
        )
        self.play(ReplacementTransform(baseLine, p1Graph), run_time=2.5)
        self.wait(1)

        # ---------------------------
        # Phase 4: Morph the Linear Approximation into the Quadratic (Degree-2) Taylor Approximation
        # ---------------------------
        p2Graph = axes.plot(
            quadratic_approx,
            x_range=approx_domain,
            color=PURPLE,
            stroke_dasharray=[5, 5]
        )
        self.play(ReplacementTransform(p1Graph, p2Graph), run_time=3)
        self.wait(1)
