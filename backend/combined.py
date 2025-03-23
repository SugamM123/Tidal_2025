from manim import *
import numpy as np

class MyScene(Scene):
    def construct(self):
        # First Snippet: Setting up the coordinate axes and title
        axes = Axes(
            x_range=[-8, 8, 1],
            y_range=[-2.5, 2.5, 1],
            axis_config={"include_numbers": False, "include_ticks": False}
        ).move_to(ORIGIN)

        title = Tex(
            "Fourier Series: Building a Square Wave",
            font_size=48
        ).to_edge(UP)

        self.add(axes, title)
        self.wait(1)

        # Second Snippet: Square Wave Function Definition and Plot
        def square_wave(x):
            period = 2 * PI
            x_modified = x % period
            if -PI <= x_modified <= PI:
                return 1
            else:
                return -1

        square_wave_graph = axes.plot(
            square_wave,
            x_range=[-3 * PI, 3 * PI, 0.01],
            color=RED,
            stroke_width=3,
        )
        caption = Tex("Target Square Wave").next_to(square_wave_graph, DOWN, buff=0.5)
        self.add(square_wave_graph, caption)
        explanation = Tex(
            "Here we display the target square wave. Our goal is to approximate this waveform by summing sine waves.",
            font_size=24
        ).to_edge(DOWN)
        self.play(Write(explanation), run_time=3)
        self.wait(2)
        self.remove(explanation)


        # Third Snippet: Fundamental Sine Wave
        sine_wave = axes.plot(
            lambda x: np.sin(x),
            x_range=[-3 * PI, 3 * PI], # Keep x_range consistent
            color=BLUE,
            stroke_width=3
        )
        sine_label = MathTex(r"\sin(x)", color=BLUE).next_to(sine_wave, UP, buff=0.1)

        explanation_text = Tex(
            "We start with the fundamental sine wave, $\sin(x)$.",
            font_size=24,
            ).to_edge(DOWN, buff=0.5)

        self.play(Create(sine_wave), Write(sine_label))
        self.play(Write(explanation_text), run_time=3)
        self.wait(2)
        self.remove(explanation_text)

        # Fourth Snippet: Adding the Third Harmonic
        third_harmonic = axes.plot(
            lambda x: (1/3) * np.sin(3*x),
            x_range=[-3 * PI, 3 * PI],  # Keep x_range consistent
            color=GREEN,
            stroke_width=3
        )
        third_harmonic_label = MathTex(r"\frac{1}{3}\sin(3x)", color=GREEN).next_to(third_harmonic, UP, buff = 0.1) # Reposition
        self.play(Create(third_harmonic), Write(third_harmonic_label), run_time=2)


        sum_wave = axes.plot(
            lambda x: np.sin(x) + (1/3) * np.sin(3*x),
            x_range=[-3 * PI, 3 * PI], # Keep x_range consistent
            color=PURPLE,
            stroke_width=5
        )
        sum_wave_label = MathTex(r"\sin(x) + \frac{1}{3}\sin(3x)", color=PURPLE).next_to(sum_wave, UP, buff=0.1) # Reposition
        self.play(Create(sum_wave), Write(sum_wave_label), run_time=2)


        explanation = Tex("We now add the third harmonic.", font_size=24).to_edge(DOWN)
        explanation2 = Tex("The sum begins to approximate the square wave.", font_size=24).next_to(explanation, UP)

        self.play(Write(explanation),Write(explanation2), run_time=4)
        self.wait(3)
        self.remove(explanation, explanation2)

        # Fifth Snippet: Adding More Harmonics
        fifth_harmonic = axes.plot(lambda x: (1/5)*np.sin(5*x), color=ORANGE, stroke_width=2, x_range=[-3*PI, 3*PI])
        seventh_harmonic = axes.plot(lambda x: (1/7)*np.sin(7*x), color=MAGENTA, stroke_width=2, x_range=[-3*PI, 3*PI])

        fifth_harmonic_label = MathTex(r"\frac{1}{5}\sin(5x)", color=ORANGE).next_to(fifth_harmonic, UP, buff = 0.1)
        seventh_harmonic_label = MathTex(r"\frac{1}{7}\sin(7x)", color=MAGENTA).next_to(seventh_harmonic, UP, buff = 0.1)

        self.play(Create(fifth_harmonic), Write(fifth_harmonic_label), run_time=1)
        self.play(Create(seventh_harmonic), Write(seventh_harmonic_label), run_time=1)

        composite_func = lambda x: np.sin(x) + (1/3)*np.sin(3*x) + (1/5)*np.sin(5*x) + (1/7)*np.sin(7*x)
        composite_curve = axes.plot(composite_func, color=WHITE, stroke_width=4, x_range=[-3*PI, 3*PI])

        composite_label = MathTex(r"\sin(x) + \frac{1}{3}\sin(3x) + \frac{1}{5}\sin(5x) + \frac{1}{7}\sin(7x)", color=WHITE).next_to(composite_curve, UP, buff=0.1)
        self.play(Create(composite_curve), Write(composite_label), run_time=1)

        caption = Tex("Fourier Approximation to Square Wave").scale(0.7).to_edge(DOWN)
        self.play(Write(caption), run_time=1)

        explanation = Tex(
            "By layering additional odd harmonics, the composite sum (white) approximates the square wave.",
             font_size=24
        ).to_edge(UP, buff=0.5) # Moved up, to prevent overlap.
        self.play(Write(explanation), run_time=3)
        self.wait(2)
